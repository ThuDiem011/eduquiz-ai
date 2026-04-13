import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // 1. Lấy tất cả các lần làm bài đã hoàn thành
  const attempts = await prisma.studentExamAttempt.findMany({
    where: { studentId: userId, status: "COMPLETED" },
    orderBy: { submittedAt: "asc" },
    include: {
      exam: {
        select: { 
          title: true, 
          subject: { select: { name: true } } 
        }
      },
      answers: {
        include: {
          question: {
            select: { 
              category: true, 
              difficulty: true, 
              chapterId: true,
              chapter: { select: { name: true } }
            }
          }
        }
      }
    }
  });

  if (attempts.length === 0) {
    return NextResponse.json({ attempts: [], stats: null });
  }

  // 2. Tính toán thống kê
  const recentScores = attempts.map(a => a.score || 0).slice(-7);
  const totalAttempts = attempts.length;
  const totalTimeMinutes = attempts.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 60;
  const overallScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts;

  // Tính mastery theo chương
  const chapterStats: Record<string, { name: string, correct: number, total: number }> = {};
  
  attempts.forEach(attempt => {
    attempt.answers.forEach(answer => {
      const chId = answer.question.chapterId;
      const chName = answer.question.chapter.name;
      if (!chapterStats[chId]) {
        chapterStats[chId] = { name: chName, correct: 0, total: 0 };
      }
      chapterStats[chId].total += 1;
      if (answer.isCorrect) chapterStats[chId].correct += 1;
    });
  });

  const masteryFields = Object.values(chapterStats)
    .map(ch => ({
      name: ch.name,
      mastery: Math.round((ch.correct / ch.total) * 100)
    }))
    .sort((a, b) => b.mastery - a.mastery);

  const strongAreas = masteryFields.filter(f => f.mastery >= 70);
  const weakAreas = masteryFields.filter(f => f.mastery < 70);

  // Xu hướng
  const trend = recentScores.length < 2 ? "stable" : 
    recentScores[recentScores.length - 1] > recentScores[0] ? "improving" : "declining";

  return NextResponse.json({
    stats: {
      overallScore: Math.round(overallScore * 10), // Scale to 100 for display
      trend,
      totalAttempts,
      totalTimeMinutes: Math.round(totalTimeMinutes),
      recentScores,
      strongAreas: strongAreas.slice(0, 3),
      weakAreas: weakAreas.slice(0, 3),
      recommendations: generateRecommendations(weakAreas)
    }
  });
}

function generateRecommendations(weakAreas: any[]) {
  if (weakAreas.length === 0) return ["Tuyệt vời! Bạn đang nắm vững mọi kiến thức. Hãy thử sức với các đề thi khó hơn."];
  
  return weakAreas.map(area => `Bạn cần tập trung ôn luyện lại ${area.name} vì mức độ thành thạo hiện tại chỉ đạt ${area.mastery}%.`);
}
