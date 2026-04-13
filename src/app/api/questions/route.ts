import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { QuestionCategory, Difficulty, QuestionStatus } from "@/types/enums";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const subjectId = searchParams.get("subjectId") || "";
  const chapterId = searchParams.get("chapterId") || "";
  const lessonId = searchParams.get("lessonId") || "";
  const category = searchParams.get("category") as QuestionCategory | null;
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const status = searchParams.get("status") as QuestionStatus | null;
  const limit = parseInt(searchParams.get("limit") || "20");
  const page = parseInt(searchParams.get("page") || "1");

  const where: any = {};
  if (search) where.content = { contains: search, mode: "insensitive" };
  if (subjectId) where.subjectId = subjectId;
  if (chapterId) where.chapterId = chapterId;
  if (lessonId) where.lessonId = lessonId;
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (status) where.status = status;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        subject: { select: { name: true, color: true } },
        chapter: { select: { name: true } },
        lesson: { select: { name: true } },
        choices: { orderBy: { orderIndex: "asc" } },
        createdBy: { select: { fullName: true } },
        _count: { select: { studentAnswers: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.question.count({ where }),
  ]);

  return NextResponse.json({ questions, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { subjectId, chapterId, lessonId, category, difficulty, content, explanation, choices, correctLabel, status, sourceType } = body;

  if (!subjectId || !chapterId || !content || !choices || choices.length !== 4) {
    return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      subjectId,
      chapterId,
      lessonId: lessonId || null,
      category: category || "CONCEPT",
      difficulty: difficulty || "MEDIUM",
      content,
      explanation,
      status: status || "APPROVED",
      sourceType: sourceType || "MANUAL",
      createdById: session.user.id,
      choices: {
        create: choices.map((c: any, i: number) => ({
          label: c.label,
          content: c.content,
          orderIndex: i,
        })),
      },
    },
    include: { choices: true },
  });

  // Set correct choice
  const correctChoice = question.choices.find((c) => c.label === correctLabel);
  if (correctChoice) {
    await prisma.question.update({
      where: { id: question.id },
      data: { correctChoiceId: correctChoice.id },
    });
  }

  return NextResponse.json(question, { status: 201 });
}
