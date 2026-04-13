import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: attemptId } = await params;

  const attempt = await prisma.studentExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          subject: { select: { name: true, color: true } },
        },
      },
      answers: {
        include: {
          question: {
            include: {
              choices: { orderBy: { orderIndex: "asc" } },
            },
          },
        },
      },
      analysisResult: true,
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  // Check permission
  if (attempt.studentId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse JSON fields from AnalysisResult if exists
  if (attempt.analysisResult) {
    try {
      attempt.analysisResult.chapterStats = JSON.parse(attempt.analysisResult.chapterStats as string);
      attempt.analysisResult.lessonStats = JSON.parse(attempt.analysisResult.lessonStats as string);
      attempt.analysisResult.categoryStats = JSON.parse(attempt.analysisResult.categoryStats as string);
      attempt.analysisResult.difficultyStats = JSON.parse(attempt.analysisResult.difficultyStats as string);
      attempt.analysisResult.comments = JSON.parse(attempt.analysisResult.comments as string);
      attempt.analysisResult.suggestions = JSON.parse(attempt.analysisResult.suggestions as string);
    } catch (e) {
      // ignore
    }
  }

  return NextResponse.json({ attempt });
}
