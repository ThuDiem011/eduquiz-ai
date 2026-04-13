/**
 * Script nhỏ: Tự lấy tất cả câu lệnh SQL từ dev.db (SQLite local)
 * và push định nghĩa bảng lên Turso thông qua @libsql/client
 *
 * Chạy: node push-to-turso.js
 */

const { createClient } = require("@libsql/client");
const Database = require("better-sqlite3");
const path = require("path");

const TURSO_URL = "libsql://ttnt-thudiem011.aws-ap-northeast-1.turso.io";
const TURSO_TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3NzYxMDY3NjYsImdpZCI6ImE4MjA2NTFkLTUzMjktNDlmYy1iM2FmLWUzOGRhNWJlNTFhYSIsImlhdCI6MTc3NjAyMDM2NiwicmlkIjoiNGI4MDFhZTAtNTdjNi00NzI3LTliMGMtNjZhMmZkY2E0YWY2In0._z959j-HQeRrvK3ysbnaIJ6FtzNQJY3Zm5JZ8G7uhqgcc0EEtID6OVeiFybnDgXIjn67TDy_9kbq-Kjr3HuqAQ";

async function main() {
  console.log("🔗 Đang kết nối Turso...");
  const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  console.log("📂 Đang đọc schema từ dev.db...");
  const localDb = new Database(path.join(__dirname, "dev.db"), {
    readonly: true,
  });

  // Lấy toàn bộ CREATE TABLE statements từ local db
  const tables = localDb
    .prepare(
      `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY rootpage`
    )
    .all();

  console.log(`📋 Tìm thấy ${tables.length} bảng: ${tables.map((t) => t.name).join(", ")}`);

  for (const table of tables) {
    if (!table.sql) continue;
    try {
      await turso.execute(`DROP TABLE IF EXISTS "${table.name}"`);
      await turso.execute(table.sql);
      console.log(`  ✅ Tạo bảng: ${table.name}`);
    } catch (err) {
      console.error(`  ❌ Lỗi bảng ${table.name}:`, err.message);
    }
  }

  // Copy dữ liệu seed nếu có
  console.log("\n📥 Đang copy dữ liệu mẫu...");
  for (const table of tables) {
    try {
      const rows = localDb.prepare(`SELECT * FROM "${table.name}"`).all();
      if (rows.length === 0) continue;

      // Lấy danh sách cột
      const cols = Object.keys(rows[0]);
      const placeholders = cols.map(() => "?").join(", ");
      const colNames = cols.map((c) => `"${c}"`).join(", ");

      for (const row of rows) {
        const values = cols.map((c) => {
          const v = row[c];
          // SQLite trả boolean dạng 0/1, giữ nguyên
          return v === null ? null : v;
        });
        await turso.execute({
          sql: `INSERT OR IGNORE INTO "${table.name}" (${colNames}) VALUES (${placeholders})`,
          args: values,
        });
      }
      console.log(`  ✅ Copy ${rows.length} dòng vào bảng: ${table.name}`);
    } catch (err) {
      console.error(`  ❌ Lỗi copy ${table.name}:`, err.message);
    }
  }

  console.log("\n🎉 Hoàn thành! Database Turso đã sẵn sàng.");
  localDb.close();
}

main().catch(console.error);
