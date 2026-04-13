import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, Users, BarChart3, Play, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: { select: { name: true, color: true } },
      createdBy: { select: { fullName: true } },
      examQuestions: {
        include: {
          question: {
            include: {
              choices: { orderBy: { orderIndex: "asc" } },
              chapter: { select: { name: true } },
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
      attempts: {
        select: {
          score: true,
          percentCorrect: true,
          submittedAt: true,
          student: { select: { fullName: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 10,
      },
      assignments: {
        include: {
          class: { select: { name: true } },
          student: { select: { fullName: true } },
        },
        take: 5,
      },
      _count: { select: { examQuestions: true, attempts: true, assignments: true } },
    },
  });

  if (!exam) notFound();

  const canManage = session.user.role === "ADMIN" || exam.createdById === session.user.id;

  const avgScore =
    exam.attempts.length > 0
      ? exam.attempts.reduce((s, a) => s + (a.score ?? 0), 0) / exam.attempts.length
      : null;

  const diffCount = { EASY: 0, MEDIUM: 0, HARD: 0 };
  exam.examQuestions.forEach((eq) => {
    const d = eq.question.difficulty as keyof typeof diffCount;
    if (d in diffCount) diffCount[d]++;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/exams">
          <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 mt-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-gray-900">{exam.title}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                exam.mode === "OFFICIAL"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {exam.mode === "OFFICIAL" ? "Kiểm tra chính thức" : "Luyện tập"}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {exam.subject.name} · Tạo bởi {exam.createdBy.fullName} ·{" "}
            {formatDate(exam.createdAt)}
          </p>
        </div>
        {session.user.role === "STUDENT" && (
          <Link href={`/exam/${exam.id}`}>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Play className="w-4 h-4" /> Làm bài
            </button>
          </Link>
        )}
        {canManage && (
          <Link href={`/dashboard/assignments?examId=${exam.id}`}>
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
              <UserCheck className="w-4 h-4" /> Giao bài
            </button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: <FileText className="w-5 h-5" />,
            label: "Số câu hỏi",
            value: exam._count.examQuestions,
            color: "bg-blue-100 text-blue-600",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            label: "Thời gian",
            value: `${exam.durationMinutes} phút`,
            color: "bg-purple-100 text-purple-600",
          },
          {
            icon: <Users className="w-5 h-5" />,
            label: "Lượt làm",
            value: exam._count.attempts,
            color: "bg-green-100 text-green-600",
          },
          {
            icon: <BarChart3 className="w-5 h-5" />,
            label: "Điểm trung bình",
            value: avgScore !== null ? avgScore.toFixed(1) : "—",
            color: "bg-orange-100 text-orange-600",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
            >
              {s.icon}
            </div>
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cài đặt */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Cài đặt đề thi</h2>
          <div className="space-y-3">
            {[
              { label: "Trộn câu hỏi", active: exam.shuffleQuestions },
              { label: "Trộn đáp án", active: exam.shuffleChoices },
              { label: "Hiển thị đáp án sau nộp", active: exam.showAnswerAfterSubmit },
              {
                label: "Hiển thị giải thích sau nộp",
                active: exam.showExplanationAfterSubmit,
              },
            ].map(({ label, active }) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-600">{label}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {active ? "Bật" : "Tắt"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Phân phối độ khó
            </p>
            <div className="flex gap-3">
              {Object.entries(diffCount).map(([diff, count]) => (
                <div
                  key={diff}
                  className={`flex-1 text-center p-2 rounded-xl ${
                    diff === "EASY"
                      ? "bg-green-50"
                      : diff === "MEDIUM"
                      ? "bg-yellow-50"
                      : "bg-red-50"
                  }`}
                >
                  <p
                    className={`text-lg font-black ${
                      diff === "EASY"
                        ? "text-green-600"
                        : diff === "MEDIUM"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {count}
                  </p>
                  <p className="text-xs text-gray-400">
                    {diff === "EASY" ? "Dễ" : diff === "MEDIUM" ? "TB" : "Khó"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kết quả gần nhất */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Kết quả gần nhất
          </h2>
          {exam.attempts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Chưa có lượt làm bài nào.</p>
          ) : (
            <div className="space-y-2">
              {exam.attempts.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.student.fullName}</p>
                    <p className="text-xs text-gray-400">
                      {a.submittedAt ? formatDate(a.submittedAt) : ""}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-black px-3 py-1 rounded-full ${
                      (a.score ?? 0) >= 8
                        ? "bg-green-100 text-green-700"
                        : (a.score ?? 0) >= 5
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {(a.score ?? 0).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Danh sách câu hỏi ({exam.examQuestions.length})
        </h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {exam.examQuestions.map((eq, i) => (
            <div
              key={eq.questionId}
              className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium line-clamp-2">
                  {eq.question.content}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      eq.question.difficulty === "EASY"
                        ? "bg-green-100 text-green-700"
                        : eq.question.difficulty === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {eq.question.difficulty === "EASY"
                      ? "Dễ"
                      : eq.question.difficulty === "MEDIUM"
                      ? "Trung bình"
                      : "Khó"}
                  </span>
                  {eq.question.chapter && (
                    <span className="text-xs text-gray-400 truncate">
                      {eq.question.chapter.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
