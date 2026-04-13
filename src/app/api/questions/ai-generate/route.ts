import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateQuestionsWithAI } from "@/lib/services/ai-generator.service";
import { QuestionCategory, Difficulty } from "@/types/enums";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    subjectId, chapterId, lessonId,
    category, difficulty, count, language, customPrompt
  } = body;

  // Fetch names for context and existing questions to avoid duplicates
  const [subject, chapter, lesson, existingQuestions] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId } }),
    prisma.chapter.findUnique({ where: { id: chapterId } }),
    lessonId ? prisma.lesson.findUnique({ where: { id: lessonId } }) : null,
    prisma.question.findMany({
      where: { chapterId },
      take: 20,
      select: { content: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  if (!subject || !chapter) {
    return NextResponse.json({ error: "Môn học hoặc chương không tồn tại" }, { status: 404 });
  }

  const excludeContents = existingQuestions.map(q => q.content);

  const questions = await generateQuestionsWithAI({
    subjectName: subject.name,
    chapterName: chapter.name,
    lessonName: lesson?.name,
    category: category as QuestionCategory,
    difficulty: difficulty as Difficulty,
    count: Math.min(count || 5, 20),
    language: language || "vi",
    customPrompt,
    excludeContents,
  });

  return NextResponse.json({ questions, subject: subject.name, chapter: chapter.name });
}
