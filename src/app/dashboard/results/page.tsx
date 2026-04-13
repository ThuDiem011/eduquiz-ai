import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Search, Users, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ResultsPage() {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Lấy tất cả bài thi được giao bởi giáo viên này hoặc toàn bộ nếu là Admin
  const whereClause = session.user.role === "ADMIN" 
    ? {} 
    : { exam: { createdById: session.user.id } };

  const attempts = await prisma.studentExamAttempt.findMany({
    where: whereClause,
    orderBy: { startedAt: "desc" },
    include: {
      exam: { select: { title: true, totalQuestions: true } },
      student: { select: { fullName: true, email: true, className: true } }
    },
    take: 100 // Giới hạn 100 bài gần nhất cho prototype
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kết quả Học sinh</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi điểm số và bài làm của tất cả học sinh</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng lượt nộp bài</p>
            <p className="text-xl font-bold text-gray-900">{attempts.length}</p>
          </div>
        </div>
      </div>

      {attempts.length === 0 ? (
        <EmptyState title="Chưa có dữ liệu thi" description="Học sinh chưa thực hiện bài thi nào hoặc bạn chưa giao bài." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Học sinh</th>
                  <th className="px-6 py-4">Đề thi</th>
                  <th className="px-6 py-4 text-center">Tỷ lệ đúng</th>
                  <th className="px-6 py-4 text-center">Điểm số</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attempts.map(attempt => (
                  <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{attempt.student.fullName}</p>
                      <p className="text-xs text-gray-500">{attempt.student.className || "Chưa cập nhật lớp"}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{attempt.exam.title}</td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {attempt.correctCount} / {attempt.exam.totalQuestions}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {attempt.score !== null ? (
                        <span className={`font-bold text-base ${attempt.score >= 8 ? 'text-green-600' : attempt.score >= 5 ? 'text-blue-600' : 'text-red-500'}`}>
                          {attempt.score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Đang làm bài</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs text-center">
                      {attempt.submittedAt 
                        ? new Date(attempt.submittedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) 
                        : "Chưa nộp"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {attempt.status === "COMPLETED" && (
                        <Link href={`/exam/${attempt.examId}/result/${attempt.id}`}>
                          <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
