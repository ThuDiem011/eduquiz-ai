import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Brain, TrendingUp, Users, BookOpen, BarChart3, Target } from "lucide-react";
import { ProgressBar } from "@/components/ui/badge";

export default async function ClassAnalyticsPage() {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return <div className="p-8 text-center text-gray-500">Không có quyền truy cập.</div>;
  }

  // Lấy dữ liệu thật từ DB
  const [totalAttempts, subjects, attempts] = await Promise.all([
    prisma.studentExamAttempt.count({ where: { status: "SUBMITTED" } }),
    prisma.subject.findMany({ include: { _count: { select: { questions: true, exams: true } } } }),
    prisma.studentExamAttempt.findMany({
      where: { status: "SUBMITTED" },
      select: { score: true, percentCorrect: true, durationSeconds: true },
      take: 200,
    }),
  ]);

  const avgScore = attempts.length > 0
    ? attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length
    : 0;
  const avgDuration = attempts.length > 0
    ? attempts.reduce((s, a) => s + (a.durationSeconds ?? 0), 0) / attempts.length / 60
    : 0;
  const passCount = attempts.filter(a => (a.score ?? 0) >= 5).length;
  const passRate = attempts.length > 0 ? (passCount / attempts.length) * 100 : 0;

  const stats = [
    { label: "Tổng lượt làm bài", value: totalAttempts, icon: <BarChart3 className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
    { label: "Điểm trung bình", value: avgScore.toFixed(1) + "/10", icon: <Target className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
    { label: "Tỷ lệ đạt (≥5)", value: passRate.toFixed(0) + "%", icon: <TrendingUp className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
    { label: "Thời gian TB/bài", value: avgDuration.toFixed(0) + " phút", icon: <Brain className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
  ];

  // Phân phối điểm (0-2, 2-4, 4-6, 6-8, 8-10)
  const bins = [0, 0, 0, 0, 0];
  attempts.forEach(a => {
    const s = a.score ?? 0;
    if (s < 2) bins[0]++;
    else if (s < 4) bins[1]++;
    else if (s < 6) bins[2]++;
    else if (s < 8) bins[3]++;
    else bins[4]++;
  });
  const maxBin = Math.max(...bins, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Phân tích lớp học</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hiệu suất học tập toàn hệ thống</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Phân phối điểm */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Phân phối điểm số</h2>
          <div className="space-y-3">
            {["0 - 2", "2 - 4", "4 - 6", "6 - 8", "8 - 10"].map((range, i) => (
              <div key={range} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-12">{range}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      i < 2 ? "bg-red-400" : i === 2 ? "bg-yellow-400" : "bg-green-400"
                    }`}
                    style={{ width: `${(bins[i] / maxBin) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 w-6 text-right">{bins[i]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Dựa trên {attempts.length} lượt nộp bài</p>
        </div>

        {/* Môn học */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" /> Kho nội dung theo môn học
          </h2>
          <div className="space-y-4">
            {subjects.map(sub => (
              <div key={sub.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 truncate">{sub.name}</span>
                  <span className="text-gray-400 text-xs">{sub._count.questions} câu hỏi · {sub._count.exams} đề</span>
                </div>
                <ProgressBar
                  value={Math.min(sub._count.questions, 100)}
                  label=""
                  color={sub.color || "#3B82F6"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
