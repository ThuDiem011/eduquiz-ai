import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Layers, BookOpen, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/badge";

export default async function ChaptersPage() {
  const session = await auth();
  
  const subjects = await prisma.subject.findMany({
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          _count: { select: { questions: true, lessons: true } }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Chương / Bài học</h1>
          <p className="text-gray-500 text-sm mt-1">Sắp xếp cấu trúc chương trình học của các bộ môn</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <EmptyState title="Chưa có môn học nào" description="Bạn cần thêm môn học trước khi quản lý chương" action={<Link href="/dashboard/subjects"><button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm mt-2">Đến trang Môn học</button></Link>} />
      ) : (
        <div className="space-y-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{subject.name}</h2>
                    <p className="text-xs text-gray-500">{subject.chapters.length} chương</p>
                  </div>
                </div>
                <Link href={`/dashboard/subjects/${subject.id}`}>
                  <button className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    Chi tiết Môn học
                  </button>
                </Link>
              </div>
              
              <div className="p-5">
                {subject.chapters.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Môn học này chưa có chương nào.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subject.chapters.map((chapter, index) => (
                      <div key={chapter.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{chapter.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{chapter.description || "Không có mô tả"}</p>
                            
                            <div className="flex gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {chapter._count.lessons} Bài học</span>
                              <span className="flex items-center gap-1 font-medium text-blue-600">{chapter._count.questions} Câu hỏi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
