import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { analyzeAttempt, calculateMasteryScore } from "@/lib/services/analytics.service";

// POST: Start a new attempt
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { examId } = body;

  if (!examId) return NextResponse.json({ error: "examId required" }, { status: 400 });

  // Check exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examQuestions: {
        include: {
          question: { include: { choices: { orderBy: { orderIndex: "asc" } } } },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!exam) return NextResponse.json({ error: "Không tìm thấy đề" }, { status: 404 });

  // Check if there's an existing in-progress attempt
  const existing = await prisma.studentExamAttempt.findFirst({
    where: { examId, studentId: session.user.id, status: "IN_PROGRESS" },
  });

  if (existing) {
    return NextResponse.json({ attemptId: existing.id, exam });
  }

  const attempt = await prisma.studentExamAttempt.create({
    data: {
      examId,
      studentId: session.user.id,
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json({ attemptId: attempt.id, exam }, { status: 201 });
}

// GET: Get attempt details
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || session.user.id;
  const examId = searchParams.get("examId");

  const where: any = { studentId };
  if (examId) where.examId = examId;

  const attempts = await prisma.studentExamAttempt.findMany({
    where,
    include: {
      exam: {
        include: {
          subject: { select: { name: true, color: true } },
        },
      },
      _count: { select: { answers: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({ attempts });
}
