import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, BookOpen, BarChart3, FileQuestion, GraduationCap, TrendingUp } from "lucide-react";

export default async function AdminStatsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-8 text-center text-gray-500">Chỉ Admin mới xem được trang này.</div>;
  }

  const [userCount, subjectCount, questionCount, examCount, attemptCount, roleBreakdown] = await Promise.all([
    prisma.user.count(),
    prisma.subject.count(),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.studentExamAttempt.count({ where: { status: "SUBMITTED" } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const recentAttempts = await prisma.studentExamAttempt.findMany({
    where: { status: "SUBMITTED" },
    include: { student: { select: { fullName: true } }, exam: { select: { title: true } } },
    orderBy: { submittedAt: "desc" },
    take: 8,
  });

  const roleMap: Record<string, string> = { ADMIN: "Quản trị viên", TEACHER: "Giáo viên", STUDENT: "Học sinh" };
  const roleColors: Record<string, string> = { ADMIN: "bg-red-100 text-red-700", TEACHER: "bg-blue-100 text-blue-700", STUDENT: "bg-green-100 text-green-700" };

  const stats = [
    { label: "Người dùng", value: userCount, icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
    { label: "Môn học", value: subjectCount, icon: <BookOpen className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
    { label: "Câu hỏi", value: questionCount, icon: <FileQuestion className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
    { label: "Đề thi", value: examCount, icon: <GraduationCap className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
    { label: "Lượt làm bài", value: attemptCount, icon: <BarChart3 className="w-5 h-5" />, color: "bg-pink-100 text-pink-600" },
    { label: "Đang tăng trưởng", value: "✓", icon: <TrendingUp className="w-5 h-5" />, color: "bg-teal-100 text-teal-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Thống kê hệ thống</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan toàn bộ hoạt động của EduQuiz AI</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Phân tách role */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Phân loại người dùng</h2>
          <div className="space-y-3">
            {roleBreakdown.map(r => (
              <div key={r.role} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleColors[r.role] || "bg-gray-100 text-gray-600"}`}>
                  {roleMap[r.role] || r.role}
                </span>
                <span className="text-lg font-black text-gray-900">{r._count._all}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lượt làm gần nhất */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-2">
            {recentAttempts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có lượt làm bài nào.</p>
            )}
            {recentAttempts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.student.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{a.exam.title}</p>
                </div>
                <div className={`ml-3 text-sm font-bold px-3 py-1 rounded-full ${
                  (a.score ?? 0) >= 8 ? "bg-green-100 text-green-700" :
                  (a.score ?? 0) >= 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>
                  {(a.score ?? 0).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
