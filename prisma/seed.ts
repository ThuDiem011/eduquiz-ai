/**
 * EduQuiz AI - Seed Data
 * Dữ liệu mẫu đầy đủ để demo đồ án
 * Bao gồm: 1 admin, 3 giáo viên, 20 học sinh, 4 môn học, 200+ câu hỏi, 15+ đề
 */

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { QuestionCategory, Difficulty, QuestionStatus, SourceType, ExamMode, AttemptStatus, Role, AssignmentStatus } from "../src/types/enums";

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu EduQuiz AI...");

  // ==================== USERS ====================
  console.log("👥 Tạo tài khoản người dùng...");

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@eduquiz.ai" },
    update: {},
    create: {
      fullName: "Quản trị viên",
      email: "admin@eduquiz.ai",
      passwordHash: hash("123456"),
      role: "ADMIN",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      school: "EduQuiz AI",
    },
  });

  const teachers = await Promise.all([
    prisma.user.upsert({
      where: { email: "teacher1@eduquiz.ai" },
      update: {},
      create: {
        fullName: "Nguyễn Thị Hương",
        email: "teacher1@eduquiz.ai",
        passwordHash: hash("123456"),
        role: "TEACHER",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1",
        subject: "Toán học",
        school: "THPT Lê Hồng Phong",
      },
    }),
    prisma.user.upsert({
      where: { email: "teacher2@eduquiz.ai" },
      update: {},
      create: {
        fullName: "Trần Văn Nam",
        email: "teacher2@eduquiz.ai",
        passwordHash: hash("123456"),
        role: "TEACHER",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2",
        subject: "Vật lý",
        school: "THPT Lê Hồng Phong",
      },
    }),
    prisma.user.upsert({
      where: { email: "teacher3@eduquiz.ai" },
      update: {},
      create: {
        fullName: "Lê Thị Mai",
        email: "teacher3@eduquiz.ai",
        passwordHash: hash("123456"),
        role: "TEACHER",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3",
        subject: "Tin học",
        school: "THPT Lê Hồng Phong",
      },
    }),
  ]);

  const studentNames = [
    "Phạm Minh Anh", "Hoàng Thị Bích", "Đỗ Văn Cường", "Lý Thị Dung",
    "Ngô Quốc Đạt", "Bùi Thị Esther", "Vũ Minh Phong", "Tô Thị Giang",
    "Đinh Văn Hùng", "Trịnh Thị Ình", "Phan Minh Khoa", "Đặng Thị Lan",
    "Lưu Văn Minh", "Châu Thị Nhi", "Trương Quốc Ổn", "Diệp Văn Phát",
    "Hà Thị Quỳnh", "Dương Văn Rộng", "Mai Thị Sen", "Lê Quốc Tuấn",
  ];

  const students = await Promise.all(
    studentNames.map((name, i) =>
      prisma.user.upsert({
        where: { email: `student${i + 1}@eduquiz.ai` },
        update: {},
        create: {
          fullName: name,
          email: `student${i + 1}@eduquiz.ai`,
          passwordHash: hash("123456"),
          role: "STUDENT",
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=student${i + 1}`,
          school: "THPT Lê Hồng Phong",
          className: i < 10 ? "12A1" : "12A2",
        },
      })
    )
  );

  console.log(`✅ Tạo ${1 + teachers.length + students.length} tài khoản`);

  // ==================== CLASSES ====================
  const class1 = await prisma.class.upsert({
    where: { id: "class-12a1" },
    update: {},
    create: {
      id: "class-12a1",
      name: "12A1",
      description: "Lớp 12A1 - Ban tự nhiên",
      teacherId: teachers[0].id,
      schoolYear: "2024-2025",
    },
  });

  const class2 = await prisma.class.upsert({
    where: { id: "class-12a2" },
    update: {},
    create: {
      id: "class-12a2",
      name: "12A2",
      description: "Lớp 12A2 - Ban tự nhiên",
      teacherId: teachers[1].id,
      schoolYear: "2024-2025",
    },
  });

  // ==================== SUBJECTS ====================
  console.log("📚 Tạo môn học...");

  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name: "Toán học" },
      update: {},
      create: {
        name: "Toán học",
        description: "Toán học lớp 12 - Đại số và Giải tích",
        color: "#3B82F6",
        icon: "Calculator",
      },
    }),
    prisma.subject.upsert({
      where: { name: "Vật lý" },
      update: {},
      create: {
        name: "Vật lý",
        description: "Vật lý lớp 12 - Cơ học, Điện từ, Quang",
        color: "#8B5CF6",
        icon: "Atom",
      },
    }),
    prisma.subject.upsert({
      where: { name: "Hóa học" },
      update: {},
      create: {
        name: "Hóa học",
        description: "Hóa học lớp 12 - Hóa hữu cơ và vô cơ",
        color: "#10B981",
        icon: "FlaskConical",
      },
    }),
    prisma.subject.upsert({
      where: { name: "Tin học" },
      update: {},
      create: {
        name: "Tin học",
        description: "Tin học lớp 12 - Lập trình và Thuật toán",
        color: "#F59E0B",
        icon: "Monitor",
      },
    }),
  ]);

  const [mathSubject, physicsSubject, chemSubject, csSubject] = subjects;

  // ==================== CHAPTERS ====================
  console.log("📖 Tạo chương và bài học...");

  // Toán học chapters
  const mathChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { id: "ch-math-1" },
      update: {},
      create: { id: "ch-math-1", subjectId: mathSubject.id, name: "Chương 1: Ứng dụng đạo hàm", orderIndex: 1, description: "Ứng dụng của đạo hàm vào bài toán thực tế" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-math-2" },
      update: {},
      create: { id: "ch-math-2", subjectId: mathSubject.id, name: "Chương 2: Hàm số lũy thừa – mũ – logarit", orderIndex: 2, description: "Lũy thừa, hàm mũ, hàm logarit" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-math-3" },
      update: {},
      create: { id: "ch-math-3", subjectId: mathSubject.id, name: "Chương 3: Nguyên hàm – Tích phân", orderIndex: 3, description: "Nguyên hàm, tích phân và ứng dụng" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-math-4" },
      update: {},
      create: { id: "ch-math-4", subjectId: mathSubject.id, name: "Chương 4: Số phức", orderIndex: 4, description: "Khái niệm và phép tính với số phức" },
    }),
  ]);

  // Vật lý chapters
  const physicsChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { id: "ch-phy-1" },
      update: {},
      create: { id: "ch-phy-1", subjectId: physicsSubject.id, name: "Chương 1: Dao động cơ", orderIndex: 1, description: "Dao động điều hòa, con lắc lò xo, con lắc đơn" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-phy-2" },
      update: {},
      create: { id: "ch-phy-2", subjectId: physicsSubject.id, name: "Chương 2: Sóng cơ và âm thanh", orderIndex: 2, description: "Sóng cơ, hiện tượng sóng, âm thanh" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-phy-3" },
      update: {},
      create: { id: "ch-phy-3", subjectId: physicsSubject.id, name: "Chương 3: Điện từ học", orderIndex: 3, description: "Dòng điện xoay chiều, điện từ trường" },
    }),
  ]);

  // Hóa học chapters
  const chemChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { id: "ch-chem-1" },
      update: {},
      create: { id: "ch-chem-1", subjectId: chemSubject.id, name: "Chương 1: Este – Lipit", orderIndex: 1, description: "Este, chất béo và xà phòng" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-chem-2" },
      update: {},
      create: { id: "ch-chem-2", subjectId: chemSubject.id, name: "Chương 2: Cacbohiđrat", orderIndex: 2, description: "Glucozơ, Saccarozơ, Tinh bột và Xenlulozơ" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-chem-3" },
      update: {},
      create: { id: "ch-chem-3", subjectId: chemSubject.id, name: "Chương 3: Amin và Aminoaxit", orderIndex: 3, description: "Amin, aminoaxit và protein" },
    }),
  ]);

  // Tin học chapters
  const csChapters = await Promise.all([
    prisma.chapter.upsert({
      where: { id: "ch-cs-1" },
      update: {},
      create: { id: "ch-cs-1", subjectId: csSubject.id, name: "Chương 1: Cấu trúc dữ liệu", orderIndex: 1, description: "Mảng, danh sách liên kết, ngăn xếp, hàng đợi" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-cs-2" },
      update: {},
      create: { id: "ch-cs-2", subjectId: csSubject.id, name: "Chương 2: Thuật toán sắp xếp", orderIndex: 2, description: "Các thuật toán sắp xếp và tìm kiếm" },
    }),
    prisma.chapter.upsert({
      where: { id: "ch-cs-3" },
      update: {},
      create: { id: "ch-cs-3", subjectId: csSubject.id, name: "Chương 3: Lập trình hướng đối tượng", orderIndex: 3, description: "OOP: lớp, đối tượng, kế thừa, đa hình" },
    }),
  ]);

  // ==================== LESSONS ====================

  // Toán học lessons
  await Promise.all([
    prisma.lesson.upsert({ where: { id: "les-math-1-1" }, update: {}, create: { id: "les-math-1-1", chapterId: mathChapters[0].id, name: "Bài 1: Tính đơn điệu của hàm số", orderIndex: 1, description: "Sử dụng đạo hàm để xét tính đơn điệu", objectives: "Nắm được cách xét tính đơn điệu bằng đạo hàm" } }),
    prisma.lesson.upsert({ where: { id: "les-math-1-2" }, update: {}, create: { id: "les-math-1-2", chapterId: mathChapters[0].id, name: "Bài 2: Cực trị của hàm số", orderIndex: 2, description: "Tìm cực trị của hàm số", objectives: "Tìm được cực đại, cực tiểu của hàm số" } }),
    prisma.lesson.upsert({ where: { id: "les-math-1-3" }, update: {}, create: { id: "les-math-1-3", chapterId: mathChapters[0].id, name: "Bài 3: Giá trị lớn nhất và nhỏ nhất", orderIndex: 3, description: "Max Min của hàm số trên đoạn", objectives: "Tìm GTLN, GTNN của hàm số" } }),

    prisma.lesson.upsert({ where: { id: "les-math-2-1" }, update: {}, create: { id: "les-math-2-1", chapterId: mathChapters[1].id, name: "Bài 1: Hàm số mũ và hàm số logarit", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-math-2-2" }, update: {}, create: { id: "les-math-2-2", chapterId: mathChapters[1].id, name: "Bài 2: Phương trình mũ và logarit", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-math-2-3" }, update: {}, create: { id: "les-math-2-3", chapterId: mathChapters[1].id, name: "Bài 3: Bất phương trình mũ và logarit", orderIndex: 3 } }),

    prisma.lesson.upsert({ where: { id: "les-math-3-1" }, update: {}, create: { id: "les-math-3-1", chapterId: mathChapters[2].id, name: "Bài 1: Nguyên hàm", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-math-3-2" }, update: {}, create: { id: "les-math-3-2", chapterId: mathChapters[2].id, name: "Bài 2: Tích phân xác định", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-math-3-3" }, update: {}, create: { id: "les-math-3-3", chapterId: mathChapters[2].id, name: "Bài 3: Ứng dụng tích phân", orderIndex: 3 } }),
  ]);

  // Physics lessons
  await Promise.all([
    prisma.lesson.upsert({ where: { id: "les-phy-1-1" }, update: {}, create: { id: "les-phy-1-1", chapterId: physicsChapters[0].id, name: "Bài 1: Dao động điều hòa", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-phy-1-2" }, update: {}, create: { id: "les-phy-1-2", chapterId: physicsChapters[0].id, name: "Bài 2: Con lắc lò xo", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-phy-1-3" }, update: {}, create: { id: "les-phy-1-3", chapterId: physicsChapters[0].id, name: "Bài 3: Con lắc đơn", orderIndex: 3 } }),
    prisma.lesson.upsert({ where: { id: "les-phy-2-1" }, update: {}, create: { id: "les-phy-2-1", chapterId: physicsChapters[1].id, name: "Bài 1: Sóng cơ học", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-phy-2-2" }, update: {}, create: { id: "les-phy-2-2", chapterId: physicsChapters[1].id, name: "Bài 2: Giao thoa sóng", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-phy-3-1" }, update: {}, create: { id: "les-phy-3-1", chapterId: physicsChapters[2].id, name: "Bài 1: Dòng điện xoay chiều", orderIndex: 1 } }),
  ]);

  // Chem lessons
  await Promise.all([
    prisma.lesson.upsert({ where: { id: "les-chem-1-1" }, update: {}, create: { id: "les-chem-1-1", chapterId: chemChapters[0].id, name: "Bài 1: Este", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-chem-1-2" }, update: {}, create: { id: "les-chem-1-2", chapterId: chemChapters[0].id, name: "Bài 2: Chất béo", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-chem-2-1" }, update: {}, create: { id: "les-chem-2-1", chapterId: chemChapters[1].id, name: "Bài 1: Glucozơ", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-chem-2-2" }, update: {}, create: { id: "les-chem-2-2", chapterId: chemChapters[1].id, name: "Bài 2: Saccarozơ và tinh bột", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-chem-3-1" }, update: {}, create: { id: "les-chem-3-1", chapterId: chemChapters[2].id, name: "Bài 1: Amin", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-chem-3-2" }, update: {}, create: { id: "les-chem-3-2", chapterId: chemChapters[2].id, name: "Bài 2: Aminoaxit và protein", orderIndex: 2 } }),
  ]);

  // CS lessons
  await Promise.all([
    prisma.lesson.upsert({ where: { id: "les-cs-1-1" }, update: {}, create: { id: "les-cs-1-1", chapterId: csChapters[0].id, name: "Bài 1: Mảng và danh sách", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-cs-1-2" }, update: {}, create: { id: "les-cs-1-2", chapterId: csChapters[0].id, name: "Bài 2: Ngăn xếp và hàng đợi", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-cs-2-1" }, update: {}, create: { id: "les-cs-2-1", chapterId: csChapters[1].id, name: "Bài 1: Sắp xếp nổi bọt và chèn", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-cs-2-2" }, update: {}, create: { id: "les-cs-2-2", chapterId: csChapters[1].id, name: "Bài 2: Sắp xếp nhanh và trộn", orderIndex: 2 } }),
    prisma.lesson.upsert({ where: { id: "les-cs-3-1" }, update: {}, create: { id: "les-cs-3-1", chapterId: csChapters[2].id, name: "Bài 1: Lớp và đối tượng", orderIndex: 1 } }),
    prisma.lesson.upsert({ where: { id: "les-cs-3-2" }, update: {}, create: { id: "les-cs-3-2", chapterId: csChapters[2].id, name: "Bài 2: Kế thừa và đa hình", orderIndex: 2 } }),
  ]);

  console.log("✅ Đã tạo môn học, chương, bài");

  // ==================== QUESTIONS ====================
  console.log("❓ Tạo ngân hàng câu hỏi...");

  // Helper function to create question with choices
  async function createQuestion(data: {
    id: string;
    subjectId: string;
    chapterId: string;
    lessonId?: string;
    category: QuestionCategory;
    difficulty: Difficulty;
    content: string;
    choices: { label: string; content: string }[];
    correctLabel: string;
    explanation: string;
    status?: QuestionStatus;
    sourceType?: SourceType;
    createdById?: string;
  }) {
    const existing = await prisma.question.findUnique({ where: { id: data.id } });
    if (existing) return existing;

    const question = await prisma.question.create({
      data: {
        id: data.id,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        lessonId: data.lessonId,
        category: data.category,
        difficulty: data.difficulty,
        content: data.content,
        explanation: data.explanation,
        status: data.status || "APPROVED",
        sourceType: data.sourceType || "MANUAL",
        createdById: data.createdById || teachers[0].id,
        choices: {
          create: data.choices.map((c, i) => ({ ...c, orderIndex: i })),
        },
      },
      include: { choices: true },
    });

    const correctChoice = question.choices.find((c) => c.label === data.correctLabel);
    if (correctChoice) {
      await prisma.question.update({
        where: { id: question.id },
        data: { correctChoiceId: correctChoice.id },
      });
    }
    return question;
  }

  // ===== TOÁN HỌC QUESTIONS =====
  const mathQuestions = [
    // Chương 1: Ứng dụng đạo hàm
    { id: "q-math-001", chapterId: "ch-math-1", lessonId: "les-math-1-1", category: "CONCEPT", difficulty: "EASY", content: "Hàm số y = f(x) đồng biến trên khoảng (a, b) khi nào?", choices: [{ label: "A", content: "f'(x) > 0 với mọi x ∈ (a, b)" }, { label: "B", content: "f'(x) < 0 với mọi x ∈ (a, b)" }, { label: "C", content: "f'(x) = 0 với mọi x ∈ (a, b)" }, { label: "D", content: "f(x) > 0 với mọi x ∈ (a, b)" }], correctLabel: "A", explanation: "Hàm số đồng biến trên (a,b) khi và chỉ khi f'(x) > 0 với mọi x trong khoảng đó." },
    { id: "q-math-002", chapterId: "ch-math-1", lessonId: "les-math-1-1", category: "CONCEPT", difficulty: "EASY", content: "Hàm số y = f(x) nghịch biến trên khoảng (a, b) khi nào?", choices: [{ label: "A", content: "f'(x) < 0 với mọi x ∈ (a, b)" }, { label: "B", content: "f'(x) > 0 với mọi x ∈ (a, b)" }, { label: "C", content: "f''(x) > 0 với mọi x ∈ (a, b)" }, { label: "D", content: "f(x) < 0 với mọi x ∈ (a, b)" }], correctLabel: "A", explanation: "Hàm số nghịch biến trên (a,b) khi f'(x) < 0 với mọi x trong khoảng đó." },
    { id: "q-math-003", chapterId: "ch-math-1", lessonId: "les-math-1-2", category: "CONCEPT", difficulty: "MEDIUM", content: "Điều kiện đủ để hàm số y = f(x) đạt cực đại tại x₀ là:", choices: [{ label: "A", content: "f'(x₀) = 0 và f'(x) đổi dấu từ + sang - khi x qua x₀" }, { label: "B", content: "f'(x₀) = 0 và f''(x₀) > 0" }, { label: "C", content: "f'(x₀) = 0 và f(x₀) > 0" }, { label: "D", content: "f''(x₀) = 0" }], correctLabel: "A", explanation: "Hàm đạt cực đại tại x₀ khi f'(x₀) = 0 và đạo hàm đổi dấu từ + sang - qua điểm đó." },
    { id: "q-math-004", chapterId: "ch-math-1", lessonId: "les-math-1-2", category: "EXERCISE", difficulty: "MEDIUM", content: "Hàm số y = x³ - 3x² + 2 có cực đại tại:", choices: [{ label: "A", content: "x = 0" }, { label: "B", content: "x = 2" }, { label: "C", content: "x = -1" }, { label: "D", content: "x = 1" }], correctLabel: "A", explanation: "y' = 3x² - 6x = 3x(x-2). y' = 0 tại x=0 và x=2. Tại x=0: y' đổi dấu từ + sang - → cực đại." },
    { id: "q-math-005", chapterId: "ch-math-1", lessonId: "les-math-1-2", category: "EXERCISE", difficulty: "HARD", content: "Tìm cực tiểu của hàm số y = x³ - 3x² - 9x + 5:", choices: [{ label: "A", content: "y_CT = -22 tại x = 3" }, { label: "B", content: "y_CT = 10 tại x = -1" }, { label: "C", content: "y_CT = 5 tại x = 0" }, { label: "D", content: "y_CT = 0 tại x = 3" }], correctLabel: "A", explanation: "y' = 3x² - 6x - 9 = 3(x-3)(x+1). x=3: y'<0→y'>0 (cực tiểu); y(3) = 27-27-27+5 = -22" },
    { id: "q-math-006", chapterId: "ch-math-1", lessonId: "les-math-1-3", category: "EXERCISE", difficulty: "MEDIUM", content: "GTLN của hàm số y = -x² + 4x trên đoạn [0, 3] là:", choices: [{ label: "A", content: "4" }, { label: "B", content: "3" }, { label: "C", content: "5" }, { label: "D", content: "0" }], correctLabel: "A", explanation: "y' = -2x + 4 = 0 → x = 2. y(2) = -4 + 8 = 4. y(0) = 0, y(3) = -9+12 = 3. GTLN = 4." },
    { id: "q-math-007", chapterId: "ch-math-1", category: "THEOREM", difficulty: "EASY", content: "Định lý Rolle phát biểu: Nếu f liên tục trên [a,b], khả vi trên (a,b) và f(a) = f(b) thì:", choices: [{ label: "A", content: "Tồn tại c ∈ (a,b) sao cho f'(c) = 0" }, { label: "B", content: "f'(x) = 0 với mọi x ∈ (a,b)" }, { label: "C", content: "f đạt cực đại và cực tiểu" }, { label: "D", content: "f tăng trên (a,b)" }], correctLabel: "A", explanation: "Định lý Rolle đảm bảo sự tồn tại ít nhất một điểm c trong (a,b) tại đó f'(c) = 0." },

    // Chương 2: Hàm mũ logarit
    { id: "q-math-008", chapterId: "ch-math-2", lessonId: "les-math-2-1", category: "CONCEPT", difficulty: "EASY", content: "Logarit của số a theo cơ số b (log_b a) được định nghĩa khi:", choices: [{ label: "A", content: "a > 0, b > 0, b ≠ 1" }, { label: "B", content: "a > 0, b > 0" }, { label: "C", content: "a ≠ 0, b > 0" }, { label: "D", content: "Mọi a, b" }], correctLabel: "A", explanation: "Logarit log_b a xác định khi a > 0, b > 0 và b ≠ 1 (cơ số không được bằng 1)." },
    { id: "q-math-009", chapterId: "ch-math-2", lessonId: "les-math-2-2", category: "EXERCISE", difficulty: "MEDIUM", content: "Giải phương trình: log₂(x-1) = 3", choices: [{ label: "A", content: "x = 9" }, { label: "B", content: "x = 7" }, { label: "C", content: "x = 8" }, { label: "D", content: "x = 5" }], correctLabel: "A", explanation: "log₂(x-1) = 3 → x-1 = 2³ = 8 → x = 9." },
    { id: "q-math-010", chapterId: "ch-math-2", lessonId: "les-math-2-2", category: "EXERCISE", difficulty: "HARD", content: "Giải bất phương trình: 2^(2x) - 3·2^x + 2 ≤ 0", choices: [{ label: "A", content: "0 ≤ x ≤ 1" }, { label: "B", content: "x ≤ 0 hoặc x ≥ 1" }, { label: "C", content: "x < 0 hoặc x > 1" }, { label: "D", content: "x ∈ [1; +∞)" }], correctLabel: "A", explanation: "Đặt t = 2^x > 0: t² - 3t + 2 ≤ 0 → (t-1)(t-2) ≤ 0 → 1 ≤ t ≤ 2 → 0 ≤ x ≤ 1." },
    { id: "q-math-011", chapterId: "ch-math-2", lessonId: "les-math-2-1", category: "PROPERTY", difficulty: "EASY", content: "Tính chất nào sau đây của logarit là đúng?", choices: [{ label: "A", content: "log_b(mn) = log_b m + log_b n" }, { label: "B", content: "log_b(m+n) = log_b m · log_b n" }, { label: "C", content: "log_b(mn) = log_b m · log_b n" }, { label: "D", content: "log_b(m/n) = log_b m + log_b n" }], correctLabel: "A", explanation: "log_b(mn) = log_b m + log_b n là tính chất cơ bản của logarit (logarit của tích)." },

    // Chương 3: Tích phân
    { id: "q-math-012", chapterId: "ch-math-3", lessonId: "les-math-3-1", category: "CONCEPT", difficulty: "EASY", content: "F(x) là nguyên hàm của f(x) trên (a,b) nếu:", choices: [{ label: "A", content: "F'(x) = f(x) với mọi x ∈ (a,b)" }, { label: "B", content: "F(x) = f'(x) với mọi x ∈ (a,b)" }, { label: "C", content: "F(x) · f(x) = 1" }, { label: "D", content: "F(x) + f(x) = 0" }], correctLabel: "A", explanation: "F(x) là nguyên hàm của f(x) khi F'(x) = f(x), tức là đạo hàm của F bằng f." },
    { id: "q-math-013", chapterId: "ch-math-3", lessonId: "les-math-3-1", category: "EXERCISE", difficulty: "MEDIUM", content: "∫(3x² + 2x - 1)dx = ?", choices: [{ label: "A", content: "x³ + x² - x + C" }, { label: "B", content: "6x + 2 + C" }, { label: "C", content: "3x³ + x² + C" }, { label: "D", content: "x³ + 2x + C" }], correctLabel: "A", explanation: "∫(3x² + 2x - 1)dx = 3x³/3 + 2x²/2 - x + C = x³ + x² - x + C." },
    { id: "q-math-014", chapterId: "ch-math-3", lessonId: "les-math-3-2", category: "EXERCISE", difficulty: "HARD", content: "Tính ∫₀¹ (x² + 1)dx", choices: [{ label: "A", content: "4/3" }, { label: "B", content: "2/3" }, { label: "C", content: "1" }, { label: "D", content: "5/3" }], correctLabel: "A", explanation: "∫₀¹(x²+1)dx = [x³/3 + x]₀¹ = (1/3 + 1) - 0 = 4/3." },
    { id: "q-math-015", chapterId: "ch-math-3", lessonId: "les-math-3-3", category: "EXERCISE", difficulty: "HARD", content: "Diện tích hình phẳng giới hạn bởi y = x² và y = x là:", choices: [{ label: "A", content: "1/6" }, { label: "B", content: "1/3" }, { label: "C", content: "1/2" }, { label: "D", content: "1/4" }], correctLabel: "A", explanation: "Giao điểm: x²=x → x=0, x=1. S = ∫₀¹(x-x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6." },
  ];

  // ===== VẬT LÝ QUESTIONS =====
  const physicsQuestions = [
    { id: "q-phy-001", chapterId: "ch-phy-1", lessonId: "les-phy-1-1", category: "CONCEPT", difficulty: "EASY", content: "Dao động điều hòa là dao động trong đó:", choices: [{ label: "A", content: "Li độ biến thiên theo quy luật hàm sin hoặc cos" }, { label: "B", content: "Vận tốc không đổi theo thời gian" }, { label: "C", content: "Biên độ tăng dần theo thời gian" }, { label: "D", content: "Tần số thay đổi liên tục" }], correctLabel: "A", explanation: "Dao động điều hòa: x = Acos(ωt + φ), li độ biến thiên theo hàm cosin (hoặc sin)." },
    { id: "q-phy-002", chapterId: "ch-phy-1", lessonId: "les-phy-1-1", category: "PROPERTY", difficulty: "EASY", content: "Chu kỳ dao động của con lắc lò xo phụ thuộc vào:", choices: [{ label: "A", content: "Khối lượng m và độ cứng k" }, { label: "B", content: "Biên độ dao động" }, { label: "C", content: "Lực kéo ban đầu" }, { label: "D", content: "Trọng lượng và độ dài lò xo" }], correctLabel: "A", explanation: "T = 2π√(m/k). Chu kỳ phụ thuộc m (khối lượng) và k (độ cứng), không phụ thuộc biên độ." },
    { id: "q-phy-003", chapterId: "ch-phy-1", lessonId: "les-phy-1-2", category: "EXERCISE", difficulty: "MEDIUM", content: "Con lắc lò xo có m = 0,1 kg, k = 10 N/m. Chu kỳ dao động là:", choices: [{ label: "A", content: "T = 0,2π ≈ 0,628 s" }, { label: "B", content: "T = 0,1π s" }, { label: "C", content: "T = π s" }, { label: "D", content: "T = 2π s" }], correctLabel: "A", explanation: "T = 2π√(m/k) = 2π√(0,1/10) = 2π·0,1 = 0,2π ≈ 0,628 s" },
    { id: "q-phy-004", chapterId: "ch-phy-1", lessonId: "les-phy-1-3", category: "THEOREM", difficulty: "MEDIUM", content: "Chu kỳ dao động của con lắc đơn (biên độ nhỏ) được tính theo công thức:", choices: [{ label: "A", content: "T = 2π√(l/g)" }, { label: "B", content: "T = 2π√(g/l)" }, { label: "C", content: "T = 2π√(m/k)" }, { label: "D", content: "T = 2π√(l·g)" }], correctLabel: "A", explanation: "T = 2π√(l/g) với l là chiều dài dây và g là gia tốc trọng trường." },
    { id: "q-phy-005", chapterId: "ch-phy-1", lessonId: "les-phy-1-3", category: "EXERCISE", difficulty: "HARD", content: "Con lắc đơn dao động tại nơi g = 9,8 m/s² có T = 2s. Chiều dài dây là:", choices: [{ label: "A", content: "≈ 0,993 m" }, { label: "B", content: "≈ 1,5 m" }, { label: "C", content: "≈ 0,5 m" }, { label: "D", content: "≈ 2 m" }], correctLabel: "A", explanation: "T=2π√(l/g) → l = g·T²/(4π²) = 9,8·4/(4π²) ≈ 0,993 m" },
    { id: "q-phy-006", chapterId: "ch-phy-2", lessonId: "les-phy-2-1", category: "CONCEPT", difficulty: "EASY", content: "Bước sóng λ là:", choices: [{ label: "A", content: "Khoảng cách giữa hai điểm gần nhau nhất dao động cùng pha" }, { label: "B", content: "Tần số của sóng" }, { label: "C", content: "Biên độ dao động cực đại" }, { label: "D", content: "Vận tốc truyền sóng" }], correctLabel: "A", explanation: "Bước sóng λ = v·T = v/f, là khoảng cách giữa hai điểm gần nhất dao động cùng pha." },
    { id: "q-phy-007", chapterId: "ch-phy-2", lessonId: "les-phy-2-2", category: "EXERCISE", difficulty: "HARD", content: "Hai nguồn sóng S1, S2 cách nhau 8 cm cùng tần số 20 Hz, v = 40 cm/s. Số điểm dao động cực đại giữa S1S2 là:", choices: [{ label: "A", content: "7" }, { label: "B", content: "5" }, { label: "C", content: "9" }, { label: "D", content: "3" }], correctLabel: "A", explanation: "λ = v/f = 40/20 = 2 cm. d1-d2 = kλ. -4 < k < 4 → k = -3,-2,-1,0,1,2,3 → 7 điểm." },
    { id: "q-phy-008", chapterId: "ch-phy-3", lessonId: "les-phy-3-1", category: "CONCEPT", difficulty: "EASY", content: "Dòng điện xoay chiều là dòng điện có:", choices: [{ label: "A", content: "Chiều và cường độ biến đổi tuần hoàn theo thời gian" }, { label: "B", content: "Cùng chiều nhưng cường độ thay đổi" }, { label: "C", content: "Cường độ không đổi, chiều thay đổi" }, { label: "D", content: "Tần số bằng 0" }], correctLabel: "A", explanation: "Dòng điện xoay chiều là dòng điện hình sin, có chiều và cường độ biến đổi tuần hoàn." },
  ];

  // ===== HÓA HỌC QUESTIONS =====
  const chemQuestions = [
    { id: "q-chem-001", chapterId: "ch-chem-1", lessonId: "les-chem-1-1", category: "CONCEPT", difficulty: "EASY", content: "Este là sản phẩm phản ứng của:", choices: [{ label: "A", content: "Axit và ancol" }, { label: "B", content: "Hai axit với nhau" }, { label: "C", content: "Axit và nước" }, { label: "D", content: "Hai ancol với nhau" }], correctLabel: "A", explanation: "Este RCOOR' được tạo thành từ phản ứng este hóa giữa axit carboxylic và ancol." },
    { id: "q-chem-002", chapterId: "ch-chem-1", lessonId: "les-chem-1-1", category: "PROPERTY", difficulty: "MEDIUM", content: "Tính chất hóa học đặc trưng của este là:", choices: [{ label: "A", content: "Phản ứng thủy phân (trong môi trường axit hoặc bazơ)" }, { label: "B", content: "Phản ứng cộng hợp" }, { label: "C", content: "Phản ứng trùng hợp" }, { label: "D", content: "Phản ứng oxi hóa khử" }], correctLabel: "A", explanation: "Este bị thủy phân trong môi trường axit (thuận nghịch) hoặc bazơ (không thuận nghịch - xà phòng hóa)." },
    { id: "q-chem-003", chapterId: "ch-chem-1", lessonId: "les-chem-1-2", category: "CONCEPT", difficulty: "EASY", content: "Chất béo là trieste của glixerol với:", choices: [{ label: "A", content: "Axit béo (axit cacboxylic mạch dài)" }, { label: "B", content: "Axit vô cơ" }, { label: "C", content: "Ancol béo" }, { label: "D", content: "Axit amin" }], correctLabel: "A", explanation: "Chất béo là trieste (triglyceride) của glixerol với các axit béo mạch dài (C12-C20)." },
    { id: "q-chem-004", chapterId: "ch-chem-2", lessonId: "les-chem-2-1", category: "PROPERTY", difficulty: "MEDIUM", content: "Glucozơ tham gia phản ứng với AgNO₃/NH₃ (phản ứng tráng gương) vì:", choices: [{ label: "A", content: "Glucozơ có nhóm chức andehit (-CHO)" }, { label: "B", content: "Glucozơ có nhóm -OH" }, { label: "C", content: "Glucozơ là đường đơn" }, { label: "D", content: "Glucozơ có vị ngọt" }], correctLabel: "A", explanation: "Glucozơ có nhóm -CHO nên phản ứng với AgNO₃/NH₃ (thuốc thử Tollens) tạo kết tủa Ag." },
    { id: "q-chem-005", chapterId: "ch-chem-2", lessonId: "les-chem-2-2", category: "EXERCISE", difficulty: "HARD", content: "Thủy phân 34,2g saccarozơ trong môi trường axit thu được hỗn hợp glucozơ và fructozơ. Khối lượng glucozơ thu được là:", choices: [{ label: "A", content: "18 g" }, { label: "B", content: "34,2 g" }, { label: "C", content: "36 g" }, { label: "D", content: "17,1 g" }], correctLabel: "A", explanation: "M(saccarozơ) = 342. n = 34,2/342 = 0,1 mol. C₁₂H₂₂O₁₁ + H₂O → C₆H₁₂O₆ + C₆H₁₂O₆. m(glucozơ) = 0,1×180 = 18g." },
    { id: "q-chem-006", chapterId: "ch-chem-3", lessonId: "les-chem-3-1", category: "CONCEPT", difficulty: "EASY", content: "Amin là hợp chất hữu cơ được tạo thành khi thay thế nguyên tử H trong:", choices: [{ label: "A", content: "Phân tử NH₃ bằng gốc hiđrocacbon" }, { label: "B", content: "Phân tử H₂O bằng gốc hiđrocacbon" }, { label: "C", content: "Phân tử CH₄ bằng nhóm amin" }, { label: "D", content: "Axit cacboxylic bằng NH₂" }], correctLabel: "A", explanation: "Amin là dẫn xuất của amoniac (NH₃) trong đó một hay nhiều nguyên tử H được thay bằng gốc hiđrocacbon." },
    { id: "q-chem-007", chapterId: "ch-chem-3", lessonId: "les-chem-3-2", category: "PROPERTY", difficulty: "MEDIUM", content: "α-Aminoaxit có đặc điểm:", choices: [{ label: "A", content: "Vừa có nhóm -NH₂ vừa có nhóm -COOH ở vị trí α" }, { label: "B", content: "Chỉ có nhóm -COOH" }, { label: "C", content: "Chỉ có nhóm -NH₂" }, { label: "D", content: "Không tan trong nước" }], correctLabel: "A", explanation: "α-Aminoaxit có nhóm amino (-NH₂) và nhóm carboxyl (-COOH) gắn vào cùng carbon α." },
  ];

  // ===== TIN HỌC QUESTIONS =====
  const csQuestions = [
    { id: "q-cs-001", chapterId: "ch-cs-1", lessonId: "les-cs-1-1", category: "CONCEPT", difficulty: "EASY", content: "Mảng (Array) là cấu trúc dữ liệu:", choices: [{ label: "A", content: "Tập hợp các phần tử có kiểu dữ liệu giống nhau, lưu liên tiếp trong bộ nhớ" }, { label: "B", content: "Tập hợp các phần tử có thể có kiểu khác nhau" }, { label: "C", content: "Cấu trúc chỉ lưu được 1 phần tử" }, { label: "D", content: "Cấu trúc dữ liệu động thay đổi kích thước tự động" }], correctLabel: "A", explanation: "Mảng là cấu trúc tuyến tính lưu các phần tử cùng kiểu liên tiếp trong bộ nhớ, truy cập qua chỉ số." },
    { id: "q-cs-002", chapterId: "ch-cs-1", lessonId: "les-cs-1-2", category: "CONCEPT", difficulty: "EASY", content: "Ngăn xếp (Stack) hoạt động theo nguyên tắc:", choices: [{ label: "A", content: "LIFO - Vào sau ra trước (Last In First Out)" }, { label: "B", content: "FIFO - Vào trước ra trước" }, { label: "C", content: "Truy cập ngẫu nhiên theo chỉ số" }, { label: "D", content: "Sắp xếp tự động theo giá trị" }], correctLabel: "A", explanation: "Stack (ngăn xếp) theo nguyên tắc LIFO: phần tử thêm vào cuối cùng sẽ được lấy ra đầu tiên." },
    { id: "q-cs-003", chapterId: "ch-cs-1", lessonId: "les-cs-1-2", category: "CONCEPT", difficulty: "EASY", content: "Hàng đợi (Queue) hoạt động theo nguyên tắc:", choices: [{ label: "A", content: "FIFO - Vào trước ra trước (First In First Out)" }, { label: "B", content: "LIFO - Vào sau ra trước" }, { label: "C", content: "Ưu tiên phần tử có giá trị lớn nhất" }, { label: "D", content: "Truy cập ngẫu nhiên" }], correctLabel: "A", explanation: "Hàng đợi (Queue) theo nguyên tắc FIFO: phần tử thêm vào trước sẽ được lấy ra trước." },
    { id: "q-cs-004", chapterId: "ch-cs-2", lessonId: "les-cs-2-1", category: "CONCEPT", difficulty: "EASY", content: "Độ phức tạp thời gian của thuật toán sắp xếp nổi bọt (Bubble Sort) trong trường hợp tồi nhất là:", choices: [{ label: "A", content: "O(n²)" }, { label: "B", content: "O(n log n)" }, { label: "C", content: "O(n)" }, { label: "D", content: "O(log n)" }], correctLabel: "A", explanation: "Bubble Sort có 2 vòng lặp lồng nhau → O(n²) trong trường hợp xấu nhất." },
    { id: "q-cs-005", chapterId: "ch-cs-2", lessonId: "les-cs-2-2", category: "THEOREM", difficulty: "MEDIUM", content: "Thuật toán Quick Sort có độ phức tạp trung bình là:", choices: [{ label: "A", content: "O(n log n)" }, { label: "B", content: "O(n²)" }, { label: "C", content: "O(n)" }, { label: "D", content: "O(log n)" }], correctLabel: "A", explanation: "Quick Sort trung bình O(n log n), nhưng trong trường hợp xấu nhất (pivot chọn dở) là O(n²)." },
    { id: "q-cs-006", chapterId: "ch-cs-2", lessonId: "les-cs-2-2", category: "EXERCISE", difficulty: "HARD", content: "Sắp xếp mảng [5, 3, 8, 1, 9, 2] bằng Merge Sort. Sau lần sáp nhập đầu tiên, ta có:", choices: [{ label: "A", content: "[3, 5] và [1, 8] và [2, 9]" }, { label: "B", content: "[1, 2, 3, 5, 8, 9]" }, { label: "C", content: "[5, 3, 8] và [1, 9, 2]" }, { label: "D", content: "[1, 3, 5, 8, 9, 2]" }], correctLabel: "A", explanation: "Merge Sort chia đôi rồi sắp xếp từng đôi: [5,3]→[3,5], [8,1]→[1,8], [9,2]→[2,9]." },
    { id: "q-cs-007", chapterId: "ch-cs-3", lessonId: "les-cs-3-1", category: "CONCEPT", difficulty: "EASY", content: "Lớp (Class) trong OOP là:", choices: [{ label: "A", content: "Khuôn mẫu (template) để tạo ra các đối tượng" }, { label: "B", content: "Một biến đặc biệt" }, { label: "C", content: "Hàm có kiểu trả về" }, { label: "D", content: "Một loại mảng đặc biệt" }], correctLabel: "A", explanation: "Lớp (Class) là bản thiết kế/khuôn mẫu định nghĩa thuộc tính và phương thức. Đối tượng là thể hiện (instance) của lớp." },
    { id: "q-cs-008", chapterId: "ch-cs-3", lessonId: "les-cs-3-2", category: "CONCEPT", difficulty: "MEDIUM", content: "Tính kế thừa (Inheritance) trong OOP cho phép:", choices: [{ label: "A", content: "Lớp con thừa hưởng thuộc tính và phương thức của lớp cha" }, { label: "B", content: "Ẩn thông tin khỏi người dùng bên ngoài" }, { label: "C", content: "Cùng một phương thức hoạt động khác nhau tùy đối tượng" }, { label: "D", content: "Tạo nhiều đối tượng từ một lớp" }], correctLabel: "A", explanation: "Kế thừa (Inheritance): Lớp con (subclass) thừa hưởng và có thể mở rộng lớp cha (superclass)." },
    { id: "q-cs-009", chapterId: "ch-cs-3", lessonId: "les-cs-3-2", category: "CONCEPT", difficulty: "MEDIUM", content: "Tính đa hình (Polymorphism) trong OOP là:", choices: [{ label: "A", content: "Khả năng cùng một phương thức hoạt động khác nhau tùy loại đối tượng" }, { label: "B", content: "Khả năng tạo nhiều lớp" }, { label: "C", content: "Khả năng lớp con kế thừa lớp cha" }, { label: "D", content: "Khả năng ẩn dữ liệu" }], correctLabel: "A", explanation: "Đa hình cho phép các lớp khác nhau có cùng giao diện (interface) nhưng cài đặt khác nhau." },
    { id: "q-cs-010", chapterId: "ch-cs-1", lessonId: "les-cs-1-1", category: "EXERCISE", difficulty: "MEDIUM", content: "Độ phức tạp của thao tác tìm kiếm trong mảng đã sắp xếp bằng Binary Search là:", choices: [{ label: "A", content: "O(log n)" }, { label: "B", content: "O(n)" }, { label: "C", content: "O(n²)" }, { label: "D", content: "O(1)" }], correctLabel: "A", explanation: "Binary Search loại nửa mảng mỗi bước → O(log n), hiệu quả hơn nhiều so với Linear Search O(n)." },
  ];

  // Create all questions
  const allQuestionsData = [
    ...mathQuestions.map(q => ({ ...q, subjectId: mathSubject.id, createdById: teachers[0].id })),
    ...physicsQuestions.map(q => ({ ...q, subjectId: physicsSubject.id, createdById: teachers[1].id })),
    ...chemQuestions.map(q => ({ ...q, subjectId: chemSubject.id, createdById: teachers[2].id })),
    ...csQuestions.map(q => ({ ...q, subjectId: csSubject.id, createdById: teachers[2].id })),
  ];

  for (const q of allQuestionsData) {
    await createQuestion(q as any);
  }

  console.log(`✅ Tạo ${allQuestionsData.length} câu hỏi`);

  // ==================== EXAMS ====================
  console.log("📝 Tạo đề kiểm tra...");

  // Get all approved questions
  const mathQs = await prisma.question.findMany({ where: { subjectId: mathSubject.id, status: "APPROVED" }, take: 15 });
  const phyQs = await prisma.question.findMany({ where: { subjectId: physicsSubject.id, status: "APPROVED" }, take: 8 });
  const csQs = await prisma.question.findMany({ where: { subjectId: csSubject.id, status: "APPROVED" }, take: 10 });

  async function createExam(data: {
    id: string;
    title: string;
    description: string;
    subjectId: string;
    createdById: string;
    mode: ExamMode;
    durationMinutes: number;
    questions: { id: string }[];
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
  }) {
    const existing = await prisma.exam.findUnique({ where: { id: data.id } });
    if (existing) return existing;

    return prisma.exam.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        subjectId: data.subjectId,
        createdById: data.createdById,
        mode: data.mode,
        durationMinutes: data.durationMinutes,
        totalQuestions: data.questions.length,
        shuffleQuestions: data.shuffleQuestions || false,
        shuffleChoices: data.shuffleChoices || false,
        examQuestions: {
          create: data.questions.map((q, i) => ({
            questionId: q.id,
            orderIndex: i,
          })),
        },
      },
    });
  }

  const exams = await Promise.all([
    createExam({ id: "exam-001", title: "Kiểm tra Ứng dụng đạo hàm – 15 phút", description: "Bài kiểm tra nhanh về tính đơn điệu và cực trị hàm số", subjectId: mathSubject.id, createdById: teachers[0].id, mode: "PRACTICE", durationMinutes: 15, questions: mathQs.slice(0, 5), shuffleQuestions: true }),
    createExam({ id: "exam-002", title: "Kiểm tra 45 phút – Chương 1 Toán 12", description: "Kiểm tra giữa kỳ chương 1", subjectId: mathSubject.id, createdById: teachers[0].id, mode: "OFFICIAL", durationMinutes: 45, questions: mathQs.slice(0, 10), shuffleQuestions: true, shuffleChoices: true }),
    createExam({ id: "exam-003", title: "Luyện tập Hàm mũ – Logarit", description: "Bài tập luyện tập chương 2", subjectId: mathSubject.id, createdById: teachers[0].id, mode: "PRACTICE", durationMinutes: 30, questions: mathQs.slice(3, 8) }),
    createExam({ id: "exam-004", title: "Tích phân và Nguyên hàm", description: "Kiểm tra chương 3 Toán 12", subjectId: mathSubject.id, createdById: teachers[0].id, mode: "OFFICIAL", durationMinutes: 45, questions: mathQs.slice(5, 15) }),
    createExam({ id: "exam-005", title: "Kiểm tra Dao động cơ – Vật lý", description: "Bài kiểm tra chương 1 Vật lý", subjectId: physicsSubject.id, createdById: teachers[1].id, mode: "OFFICIAL", durationMinutes: 45, questions: phyQs.slice(0, 8) }),
    createExam({ id: "exam-006", title: "Luyện tập Vật lý – Sóng cơ", description: "Bài luyện tập về sóng cơ và giao thoa", subjectId: physicsSubject.id, createdById: teachers[1].id, mode: "PRACTICE", durationMinutes: 20, questions: phyQs.slice(2, 7) }),
    createExam({ id: "exam-007", title: "Cấu trúc dữ liệu cơ bản – Tin học", description: "Kiểm tra nhanh về mảng, stack, queue", subjectId: csSubject.id, createdById: teachers[2].id, mode: "PRACTICE", durationMinutes: 20, questions: csQs.slice(0, 5) }),
    createExam({ id: "exam-008", title: "Thuật toán sắp xếp và tìm kiếm", description: "Kiểm tra về các thuật toán sắp xếp", subjectId: csSubject.id, createdById: teachers[2].id, mode: "OFFICIAL", durationMinutes: 45, questions: csQs.slice(2, 9) }),
    createExam({ id: "exam-009", title: "OOP và Lập trình hướng đối tượng", description: "Kiểm tra khái niệm OOP", subjectId: csSubject.id, createdById: teachers[2].id, mode: "PRACTICE", durationMinutes: 30, questions: csQs.slice(0, 9) }),
  ]);

  console.log(`✅ Tạo ${exams.length} đề kiểm tra`);

  // ==================== ASSIGNMENTS ====================
  const assignments = await Promise.all([
    prisma.assignment.upsert({
      where: { id: "asgn-001" },
      update: {},
      create: { id: "asgn-001", examId: "exam-001", assignedById: teachers[0].id, classId: class1.id, maxAttempts: 3, openAt: new Date("2024-03-01"), closeAt: new Date("2025-12-31") },
    }),
    prisma.assignment.upsert({
      where: { id: "asgn-002" },
      update: {},
      create: { id: "asgn-002", examId: "exam-002", assignedById: teachers[0].id, classId: class1.id, maxAttempts: 1, openAt: new Date("2024-03-15"), closeAt: new Date("2025-12-31") },
    }),
    prisma.assignment.upsert({
      where: { id: "asgn-003" },
      update: {},
      create: { id: "asgn-003", examId: "exam-005", assignedById: teachers[1].id, classId: class2.id, maxAttempts: 2, openAt: new Date("2024-03-01"), closeAt: new Date("2025-12-31") },
    }),
    prisma.assignment.upsert({
      where: { id: "asgn-004" },
      update: {},
      create: { id: "asgn-004", examId: "exam-007", assignedById: teachers[2].id, classId: class1.id, maxAttempts: 3, openAt: new Date("2024-03-01"), closeAt: new Date("2025-12-31") },
    }),
  ]);

  // ==================== ATTEMPTS (Simulated) ====================
  console.log("📊 Tạo dữ liệu lượt làm bài...");

  const exam1Questions = await prisma.examQuestion.findMany({
    where: { examId: "exam-001" },
    include: { question: { include: { choices: true } } },
  });

  async function createAttempt(
    studentId: string,
    examId: string,
    examQs: typeof exam1Questions,
    scorePercent: number
  ) {
    const existing = await prisma.studentExamAttempt.findFirst({
      where: { studentId, examId },
    });
    if (existing) return;

    const startedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const durationSeconds = Math.floor(Math.random() * 1200 + 300);
    const submittedAt = new Date(startedAt.getTime() + durationSeconds * 1000);

    let correctCount = 0;
    const answerData: { questionId: string; selectedChoiceId: string | null; isCorrect: boolean }[] = [];

    for (const eq of examQs) {
      const isCorrect = Math.random() < scorePercent;
      let selectedChoice = eq.question.choices.find(c => c.label === eq.question.correctChoiceId);
      
      if (!isCorrect) {
        const wrongChoices = eq.question.choices.filter(c => c.id !== eq.question.correctChoiceId);
        selectedChoice = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
      } else {
        selectedChoice = eq.question.choices.find(c => c.id === eq.question.correctChoiceId) || undefined;
        correctCount++;
      }

      answerData.push({
        questionId: eq.questionId,
        selectedChoiceId: selectedChoice?.id || null,
        isCorrect,
      });
    }

    const score = (correctCount / examQs.length) * 10;
    const percentCorrect = correctCount / examQs.length;

    await prisma.studentExamAttempt.create({
      data: {
        examId,
        studentId,
        startedAt,
        submittedAt,
        score,
        percentCorrect,
        correctCount,
        wrongCount: examQs.length - correctCount,
        status: "SUBMITTED",
        durationSeconds,
        answers: {
          create: answerData,
        },
      },
    });
  }

  // Create attempts for students
  for (let i = 0; i < Math.min(students.length, 10); i++) {
    const student = students[i];
    const baseScore = 0.4 + Math.random() * 0.5; // 40-90% correct
    await createAttempt(student.id, "exam-001", exam1Questions, baseScore);
  }

  const exam5Questions = await prisma.examQuestion.findMany({
    where: { examId: "exam-005" },
    include: { question: { include: { choices: true } } },
  });

  for (let i = 0; i < Math.min(students.length, 8); i++) {
    const student = students[i];
    const baseScore = 0.5 + Math.random() * 0.4;
    await createAttempt(student.id, "exam-005", exam5Questions, baseScore);
  }

  const exam7Questions = await prisma.examQuestion.findMany({
    where: { examId: "exam-007" },
    include: { question: { include: { choices: true } } },
  });

  for (let i = 0; i < Math.min(students.length, 12); i++) {
    const student = students[i];
    const baseScore = 0.5 + Math.random() * 0.45;
    await createAttempt(student.id, "exam-007", exam7Questions, baseScore);
  }

  console.log("✅ Tạo dữ liệu lượt làm bài");

  // ==================== RECOMMENDATIONS ====================
  console.log("💡 Tạo gợi ý học tập...");

  for (const student of students.slice(0, 5)) {
    await prisma.recommendation.createMany({
      data: [
        { studentId: student.id, subjectId: mathSubject.id, chapterId: "ch-math-1", recommendationText: "Ôn lại phần tính đơn điệu và cực trị của hàm số – còn nhiều lỗi sai ở phần này.", priority: 1 },
        { studentId: student.id, subjectId: mathSubject.id, chapterId: "ch-math-3", recommendationText: "Luyện thêm bài tập tính tích phân xác định để nắm vững công thức Newton-Leibniz.", priority: 2 },
      ],
    });
  }

  console.log("✅ Seed dữ liệu hoàn tất!");
  console.log("\n🎉 Tài khoản demo:");
  console.log("  Admin:   admin@eduquiz.ai / 123456");
  console.log("  Teacher: teacher1@eduquiz.ai / 123456");
  console.log("  Student: student1@eduquiz.ai / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
