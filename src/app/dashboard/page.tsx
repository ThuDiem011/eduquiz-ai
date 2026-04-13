import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/badge";
import {
  Users, BookOpen, FileText, ClipboardList,
  TrendingUp, Brain, Trophy, AlertCircle
} from "lucide-react";
import { formatDate, getDifficultyLabel, getCategoryLabel } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;

  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "TEACHER") return <TeacherDashboard userId={session.user.id} />;
  return <StudentDashboard userId={session.user.id} name={session.user.name || ""} />;
}

async function AdminDashboard() {
  const [userCount, subjectCount, questionCount, examCount, attemptCount, teacherCount, studentCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.subject.count(),
      prisma.question.count(),
      prisma.exam.count(),
      prisma.studentExamAttempt.count({ where: { status: "SUBMITTED" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
    ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { fullName: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Tổng quan Hệ thống</h1>
        <p className="text-gray-500 mt-1">Quản trị toàn bộ EduQuiz AI</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng người dùng" value={userCount} icon={<Users className="w-5 h-5 text-white" />} color="blue" />
        <StatCard title="Giáo viên" value={teacherCount} icon={<Brain className="w-5 h-5 text-white" />} color="purple" />
        <StatCard title="Học sinh" value={studentCount} icon={<Trophy className="w-5 h-5 text-white" />} color="green" />
        <StatCard title="Môn học" value={subjectCount} icon={<BookOpen className="w-5 h-5 text-white" />} color="orange" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Câu hỏi" value={questionCount} icon={<AlertCircle className="w-5 h-5 text-white" />} color="blue" description="Trong ngân hàng câu hỏi" />
        <StatCard title="Đề kiểm tra" value={examCount} icon={<FileText className="w-5 h-5 text-white" />} color="purple" />
        <StatCard title="Lượt làm bài" value={attemptCount} icon={<ClipboardList className="w-5 h-5 text-white" />} color="green" description="Đã nộp" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Người dùng mới nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                    {u.fullName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{u.fullName}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    u.role === "ADMIN" ? "bg-red-100 text-red-700" :
                    u.role === "TEACHER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  }`}>
                    {u.role === "ADMIN" ? "Admin" : u.role === "TEACHER" ? "Giáo viên" : "Học sinh"}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function TeacherDashboard({ userId }: { userId: string }) {
  const [examCount, questionCount, attemptCount, myExams] = await Promise.all([
    prisma.exam.count({ where: { createdById: userId } }),
    prisma.question.count({ where: { createdById: userId } }),
    prisma.studentExamAttempt.count({
      where: { exam: { createdById: userId }, status: "SUBMITTED" }
    }),
    prisma.exam.findMany({
      where: { createdById: userId },
      include: {
        subject: { select: { name: true, color: true } },
        _count: { select: { attempts: true, examQuestions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Average score across all my exams
  const avgScore = await prisma.studentExamAttempt.aggregate({
    where: { exam: { createdById: userId }, status: "SUBMITTED" },
    _avg: { percentCorrect: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Dashboard Giáo viên</h1>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động giảng dạy</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Đề đã tạo" value={examCount} icon={<FileText className="w-5 h-5 text-white" />} color="blue" />
        <StatCard title="Câu hỏi" value={questionCount} icon={<Brain className="w-5 h-5 text-white" />} color="purple" />
        <StatCard title="Lượt làm bài" value={attemptCount} icon={<ClipboardList className="w-5 h-5 text-white" />} color="green" />
        <StatCard
          title="Điểm TB lớp"
          value={avgScore._avg.percentCorrect ? `${(avgScore._avg.percentCorrect * 100).toFixed(1)}%` : "—"}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="orange"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Đề kiểm tra gần đây</CardTitle>
              <Link href="/dashboard/exams" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: exam.subject.color || "#3B82F6" }}
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{exam.title}</p>
                      <p className="text-xs text-gray-400">{exam.subject.name} · {exam._count.examQuestions} câu · {exam._count.attempts} lượt</p>
                    </div>
                  </div>
                  <Link href={`/dashboard/exams/${exam.id}`} className="text-xs text-blue-600 hover:underline">Chi tiết</Link>
                </div>
              ))}
              {myExams.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có đề nào. <Link href="/dashboard/exams/create" className="text-blue-600 hover:underline">Tạo đề ngay</Link></p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/dashboard/questions/new", label: "Thêm câu hỏi", icon: "➕", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
                { href: "/dashboard/exams/create", label: "Tạo đề", icon: "📝", color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700" },
                { href: "/dashboard/questions/ai-generate", label: "AI tạo câu hỏi", icon: "✨", color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
                { href: "/dashboard/assignments", label: "Giao bài", icon: "📨", color: "bg-green-50 hover:bg-green-100 text-green-700" },
                { href: "/dashboard/questions", label: "Ngân hàng câu hỏi", icon: "🗃️", color: "bg-orange-50 hover:bg-orange-100 text-orange-700" },
                { href: "/dashboard/analytics/class", label: "Phân tích lớp", icon: "📊", color: "bg-teal-50 hover:bg-teal-100 text-teal-700" },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className={`flex items-center gap-2 p-4 rounded-xl font-medium text-sm transition-all duration-200 ${action.color}`}
                >
                  <span className="text-lg">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function StudentDashboard({ userId, name }: { userId: string; name: string }) {
  const [attempts, assignments, recommendations] = await Promise.all([
    prisma.studentExamAttempt.findMany({
      where: { studentId: userId, status: "SUBMITTED" },
      include: {
        exam: { include: { subject: { select: { name: true, color: true } } } },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
    prisma.assignment.findMany({
      where: { status: "ACTIVE", OR: [{ student: { id: userId } }, { class: { members: { some: { userId } } } }] },
      include: {
        exam: { include: { subject: { select: { name: true, color: true } } } },
      },
      take: 5,
    }),
    prisma.recommendation.findMany({
      where: { studentId: userId, isRead: false },
      orderBy: { priority: "asc" },
      take: 3,
    }),
  ]);

  const avgScore = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + (a.percentCorrect || 0), 0) / attempts.length
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Chào, {name.split(" ").pop()}! 👋</h1>
        <p className="text-gray-500 mt-1">Tiếp tục hành trình học tập của bạn</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bài đã làm" value={attempts.length} icon={<ClipboardList className="w-5 h-5 text-white" />} color="blue" />
        <StatCard title="Điểm TB" value={`${(avgScore * 100).toFixed(0)}%`} icon={<TrendingUp className="w-5 h-5 text-white" />} color="green" />
        <StatCard title="Bài được giao" value={assignments.length} icon={<BookOpen className="w-5 h-5 text-white" />} color="purple" />
        <StatCard title="Gợi ý ôn tập" value={recommendations.length} icon={<Brain className="w-5 h-5 text-white" />} color="orange" />
      </div>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Gợi ý ôn tập của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-amber-500 mt-0.5 font-bold text-sm">#{r.priority}</span>
                  <p className="text-sm text-gray-700">{r.recommendationText}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bài được giao</CardTitle>
              <Link href="/dashboard/my-exams" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.slice(0, 4).map((asgn) => (
                <div key={asgn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: asgn.exam.subject.color || "#3B82F6" }}
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{asgn.exam.title}</p>
                      <p className="text-xs text-gray-400">{asgn.exam.subject.name}</p>
                    </div>
                  </div>
                  <Link
                    href={`/exam/${asgn.examId}`}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Làm bài
                  </Link>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có bài nào được giao</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lịch sử làm bài</CardTitle>
              <Link href="/dashboard/history" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempts.map((attempt) => {
                const percent = Math.round((attempt.percentCorrect || 0) * 100);
                return (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        percent >= 80 ? "bg-green-100 text-green-700" :
                        percent >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {percent}%
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 truncate max-w-36">{attempt.exam.title}</p>
                        <p className="text-xs text-gray-400">{attempt.correctCount}/{attempt.correctCount + attempt.wrongCount} đúng</p>
                      </div>
                    </div>
                    <Link href={`/exam/${attempt.examId}/result/${attempt.id}`} className="text-xs text-blue-600 hover:underline">
                      Xem kết quả
                    </Link>
                  </div>
                );
              })}
              {attempts.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có lịch sử làm bài</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
