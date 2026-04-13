import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  const exams = await prisma.exam.findMany({
    where: {
      ...(subjectId ? { subjectId } : {}),
      ...(session.user.role === "TEACHER" ? { createdById: session.user.id } : {}),
    },
    include: {
      subject: { select: { name: true, color: true } },
      createdBy: { select: { fullName: true } },
      _count: { select: { examQuestions: true, attempts: true, assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ exams });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title, description, subjectId, mode, durationMinutes,
      shuffleQuestions, shuffleChoices, showAnswerAfterSubmit, showExplanationAfterSubmit,
      startTime, endTime, questionIds, passingScore
    } = body;

    if (!title || !subjectId || !questionIds?.length) {
      return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc: tiêu đề, môn học hoặc câu hỏi" }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        subjectId,
        createdById: session.user.id,
        mode: mode || "PRACTICE",
        durationMinutes: durationMinutes || 45,
        totalQuestions: questionIds.length,
        shuffleQuestions: !!shuffleQuestions,
        shuffleChoices: !!shuffleChoices,
        showAnswerAfterSubmit: showAnswerAfterSubmit !== false,
        showExplanationAfterSubmit: showExplanationAfterSubmit !== false,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        passingScore: passingScore || 50,
        examQuestions: {
          create: questionIds.map((id: string, i: number) => ({
            questionId: id,
            orderIndex: i,
          })),
        },
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    console.error("EXAM_CREATE_ERROR:", error);
    return NextResponse.json({ 
      error: "Không thể tạo đề thi", 
      details: error.message 
    }, { status: 500 });
  }
}
