import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Layers, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/badge";
import { NewSubjectDialog } from "./NewSubjectDialog";
import { UploadPDFDialog } from "./UploadPDFDialog";

export default async function SubjectsPage() {
  const session = await auth();
  const subjects = await prisma.subject.findMany({
    include: {
      _count: { select: { chapters: true, questions: true, exams: true } },
    },
    orderBy: { name: "asc" },
  });

  const subjectColors: Record<string, string> = {
    "Toán học": "from-blue-500 to-blue-600",
    "Vật lý": "from-purple-500 to-purple-600",
    "Hóa học": "from-green-500 to-green-600",
    "Tin học": "from-amber-500 to-orange-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Môn học</h1>
          <p className="text-gray-500 text-sm mt-1">{subjects.length} môn học trong hệ thống</p>
        </div>
        {session?.user.role !== "STUDENT" && (
          <div className="flex items-center">
            <NewSubjectDialog />
            <UploadPDFDialog />
          </div>
        )}
      </div>

      {subjects.length === 0 ? (
        <EmptyState title="Chưa có môn học nào" description="Thêm môn học để bắt đầu" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => {
            const gradient = subjectColors[subject.name] || "from-gray-500 to-gray-600";
            return (
              <Link key={subject.id} href={`/dashboard/subjects/${subject.id}`}>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <BookOpen className="w-12 h-12 text-white/80" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{subject.name}</h3>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2">{subject.description || "Không có mô tả"}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { value: subject._count.chapters, label: "Chương" },
                        { value: subject._count.questions, label: "Câu hỏi" },
                        { value: subject._count.exams, label: "Đề thi" },
                      ].map(({ value, label }) => (
                        <div key={label} className="bg-gray-50 rounded-xl py-2">
                          <p className="text-lg font-bold text-gray-900">{value}</p>
                          <p className="text-xs text-gray-400">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
