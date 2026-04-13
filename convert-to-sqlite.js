const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Change provider
schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"\n  // previewFeatures = ["driverAdapters"]');

// 2. Remove all enums
schema = schema.replace(/enum \w+ {[^}]*}/g, '');

// 3. Replace enum usages with String
// Users
schema = schema.replace(/role\s+Role\s+@default\(STUDENT\)/g, 'role          String      @default("STUDENT")');
// Questions
schema = schema.replace(/category\s+QuestionCategory\s+@default\(CONCEPT\)/g, 'category      String @default("CONCEPT")');
schema = schema.replace(/difficulty\s+Difficulty\s+@default\(MEDIUM\)/g, 'difficulty    String       @default("MEDIUM")');
schema = schema.replace(/status\s+QuestionStatus\s+@default\(DRAFT\)/g, 'status        String   @default("DRAFT")');
schema = schema.replace(/sourceType\s+SourceType\s+@default\(MANUAL\)/g, 'sourceType    String       @default("MANUAL")');
// Exams
schema = schema.replace(/mode\s+ExamMode\s+@default\(PRACTICE\)/g, 'mode                     String  @default("PRACTICE")');
// ClassMember
schema = schema.replace(/role\s+Role\s+@default\(STUDENT\)/g, 'role      String      @default("STUDENT")');
// Assignment
schema = schema.replace(/status\s+AssignmentStatus\s+@default\(ACTIVE\)/g, 'status      String @default("ACTIVE")');
// StudentExamAttempt
schema = schema.replace(/status\s+AttemptStatus\s+@default\(IN_PROGRESS\)/g, 'status          String @default("IN_PROGRESS")');
// AnalyticsSnapshot
schema = schema.replace(/category\s+QuestionCategory\?/g, 'category      String?');

// 4. Sqlite does not support Json types natively in older Prisma versions, but we can use String
schema = schema.replace(/Json/g, 'String');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Schema converted to SQLite!");
