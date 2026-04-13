import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClipboardList, ExternalLink, Calendar, Target, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/badge";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await auth();
  if (!session) return null;

  const attempts = await prisma.studentExamAttempt.findMany({
    where: { studentId: session.user.id },
    orderBy: { startedAt: "desc" },
    include: {
      exam: {
        select: { title: true, totalQuestions: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Lịch sử làm bài</h1>
        <p className="text-gray-500 text-sm mt-1">Lịch sử và điểm số các bài kiểm tra đã thực hiện</p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState title="Lịch sử trống" description="Bạn chưa hoàn thành bài làm nào." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Tên bài thi</th>
                  <th className="px-6 py-4">Thời gian nộp</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Kết quả</th>
                  <th className="px-6 py-4 text-center">Điểm (Hệ 10)</th>
                  <th className="px-6 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attempts.map(attempt => (
                  <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{attempt.exam.title}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {new Date(attempt.startedAt).toLocaleDateString("vi-VN")}</div>
                    </td>
                    <td className="px-6 py-4">
                      {attempt.status === "COMPLETED" ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Đã nộp bài</span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Đang làm</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {attempt.correctCount} / {attempt.exam.totalQuestions} đúng
                    </td>
                    <td className="px-6 py-4 text-center">
                      {attempt.score !== null ? (
                        <span className={`font-bold text-base ${attempt.score >= 8 ? 'text-green-600' : attempt.score >= 5 ? 'text-blue-600' : 'text-red-500'}`}>
                          {attempt.score.toFixed(1)}
                        </span>
                      ) : "-"}
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
