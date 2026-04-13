import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, FileText, Users, Plus, Eye, Play } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import { EmptyState } from "@/components/ui/badge";

export default async function ExamsPage() {
  const session = await auth();
  if (!session) return null;

  const exams = await prisma.exam.findMany({
    where: session.user.role === "TEACHER" ? { createdById: session.user.id } : {},
    include: {
      subject: { select: { name: true, color: true } },
      createdBy: { select: { fullName: true } },
      _count: { select: { examQuestions: true, assignments: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Danh sách đề kiểm tra</h1>
          <p className="text-gray-500 text-sm mt-1">{exams.length} đề kiểm tra</p>
        </div>
        {session.user.role !== "STUDENT" && (
          <Link href="/dashboard/exams/create">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Tạo đề mới
            </button>
          </Link>
        )}
      </div>

      {exams.length === 0 ? (
        <EmptyState
          title="Chưa có đề kiểm tra nào"
          description="Tạo đề kiểm tra đầu tiên của bạn"
          action={
            session.user.role !== "STUDENT" ? (
              <Link href="/dashboard/exams/create">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">Tạo đề</button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: (exam.subject.color || "#3B82F6") + "20" }}
                  >
                    <FileText className="w-6 h-6" style={{ color: exam.subject.color || "#3B82F6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 text-base">{exam.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        exam.mode === "OFFICIAL" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {exam.mode === "OFFICIAL" ? "Chính thức" : "Luyện tập"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{exam.subject.name} · Tạo bởi {exam.createdBy.fullName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{exam._count.examQuestions} câu</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.durationMinutes} phút</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{exam._count.attempts} lượt làm</span>
                      <span>{formatDate(exam.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/dashboard/exams/${exam.id}`}>
                    <button className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Chi tiết
                    </button>
                  </Link>
                  {session.user.role === "STUDENT" && (
                    <Link href={`/exam/${exam.id}`}>
                      <button className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                        <Play className="w-3.5 h-3.5" /> Làm bài
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
