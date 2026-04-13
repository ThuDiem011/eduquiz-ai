import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { analyzeAttempt } from "@/lib/services/analytics.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: attemptId } = await params;
  const body = await req.json();
  const { answers } = body; // [{ questionId, selectedChoiceId }]

  const attempt = await prisma.studentExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          examQuestions: {
            include: {
              question: {
                include: {
                  choices: true,
                  chapter: true,
                  lesson: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Không tìm thấy bài làm" }, { status: 404 });
  if (attempt.studentId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (attempt.status !== "IN_PROGRESS") return NextResponse.json({ error: "Bài đã được nộp" }, { status: 400 });

  const now = new Date();
  const durationSeconds = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);

  // Process answers and calculate score
  let correctCount = 0;
  const answerResults: { questionId: string; selectedChoiceId: string | null; isCorrect: boolean }[] = [];
  const analyticData: any[] = [];

  for (const eq of attempt.exam.examQuestions) {
    const q = eq.question;
    const userAnswer = answers?.find((a: any) => a.questionId === q.id);
    const selectedChoiceId = userAnswer?.selectedChoiceId || null;
    const isCorrect = selectedChoiceId === q.correctChoiceId;

    if (isCorrect) correctCount++;

    answerResults.push({ questionId: q.id, selectedChoiceId, isCorrect });
    analyticData.push({
      questionId: q.id,
      isCorrect,
      difficulty: q.difficulty,
      category: q.category,
      chapterId: q.chapterId,
      chapterName: q.chapter.name,
      lessonId: q.lessonId,
      lessonName: q.lesson?.name,
    });
  }

  const total = attempt.exam.examQuestions.length;
  const percentCorrect = total > 0 ? correctCount / total : 0;
  const score = percentCorrect * 10;

  // Save answers
  await prisma.studentAnswer.deleteMany({ where: { attemptId } });
  await prisma.studentAnswer.createMany({
    data: answerResults.map((a) => ({
      attemptId,
      questionId: a.questionId,
      selectedChoiceId: a.selectedChoiceId,
      isCorrect: a.isCorrect,
    })),
  });

  // Update attempt
  await prisma.studentExamAttempt.update({
    where: { id: attemptId },
    data: {
      submittedAt: now,
      score,
      percentCorrect,
      correctCount,
      wrongCount: total - correctCount,
      skippedCount: total - answerResults.filter((a) => a.selectedChoiceId).length,
      status: "SUBMITTED",
      durationSeconds,
    },
  });

  // Generate analysis
  const analysis = analyzeAttempt(analyticData);

  // Save analysis result
  await prisma.analysisResult.upsert({
    where: { attemptId },
    update: {
      chapterStats: JSON.stringify(analysis.chapterStats),
      lessonStats: JSON.stringify(analysis.lessonStats),
      categoryStats: JSON.stringify(analysis.categoryStats),
      difficultyStats: JSON.stringify(analysis.difficultyStats),
      comments: JSON.stringify(analysis.comments),
      suggestions: JSON.stringify(analysis.suggestions),
    },
    create: {
      attemptId,
      chapterStats: JSON.stringify(analysis.chapterStats),
      lessonStats: JSON.stringify(analysis.lessonStats),
      categoryStats: JSON.stringify(analysis.categoryStats),
      difficultyStats: JSON.stringify(analysis.difficultyStats),
      comments: JSON.stringify(analysis.comments),
      suggestions: JSON.stringify(analysis.suggestions),
    },
  });

  return NextResponse.json({
    score,
    percentCorrect,
    correctCount,
    wrongCount: total - correctCount,
    attemptId,
    analysis,
  });
}
