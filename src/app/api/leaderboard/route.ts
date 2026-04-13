import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Lấy Top 20 học sinh có điểm trung bình cao nhất
  // Phức tạp hơn: aggregate từ StudentExamAttempt
  const leaderboard = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      school: true,
      _count: {
        select: { attempts: true }
      },
      attempts: {
        where: { status: "COMPLETED" },
        select: { score: true }
      }
    },
    take: 20
  });

  // Tính toán điểm trung bình và xếp hạng
  const rankedData = leaderboard
    .map(user => {
      const validAttempts = user.attempts.filter(a => a.score !== null);
      const avgScore = validAttempts.length > 0 
        ? validAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / validAttempts.length 
        : 0;
      
      return {
        id: user.id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        school: user.school,
        totalAttempts: user._count.attempts,
        avgScore: parseFloat(avgScore.toFixed(2))
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore || b.totalAttempts - a.totalAttempts);

  return NextResponse.json({ leaderboard: rankedData });
}
