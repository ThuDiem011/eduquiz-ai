import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, FileQuestion, Layers, Plus, Pencil, Trash2, Tag, CheckCircle2 } from "lucide-react";
import { getDifficultyLabel, getCategoryLabel, getDifficultyColor, getCategoryColor, formatDate } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui/badge";

export default async function SubjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session) return notFound();

  const id = params.id;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      _count: { select: { chapters: true, exams: true } },
      chapters: {
        orderBy: { orderIndex: "asc" }
      },
      questions: {
        include: {
          chapter: true,
          lesson: true,
          createdBy: true,
          choices: true,
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!subject) return notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subjects">
          <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-900">{subject.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{subject.description || "Chưa có mô tả"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng số chương</p>
            <p className="text-xl font-bold text-gray-900">{subject._count.chapters}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngân hàng câu hỏi</p>
            <p className="text-xl font-bold text-gray-900">{subject.questions.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Đề thi liên kết</p>
            <p className="text-xl font-bold text-gray-900">{subject._count.exams}</p>
          </div>
        </div>
      </div>

      {/* Embedded Question Bank */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ngân hàng câu hỏi ({subject.questions.length})</h2>
            <p className="text-sm text-gray-500">Danh sách các câu hỏi thuộc môn học này</p>
          </div>
          <Link href={`/dashboard/questions/new`}>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
          </Link>
        </div>

        <div className="p-5">
          {subject.questions.length === 0 ? (
            <EmptyState 
              title="Chưa có câu hỏi nào" 
              description="Bắt đầu thêm câu hỏi vào ngân hàng để tạo đề thi."
              action={
                <Link href={`/dashboard/questions/new`}>
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                    Thêm câu hỏi đầu tiên
                  </button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {subject.questions.map((q, i) => (
                <div key={q.id} className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-mono text-gray-400">#{i + 1}</span>
                      <Badge variant={q.status === "APPROVED" ? "success" : q.status === "DRAFT" ? "warning" : "secondary"}>
                        {q.status === "APPROVED" ? "Đã duyệt" : q.status === "DRAFT" ? "Nháp" : "Ẩn"}
                      </Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getDifficultyColor(q.difficulty)}`}>
                        {getDifficultyLabel(q.difficulty)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(q.category)}`}>
                        {getCategoryLabel(q.category)}
                      </span>
                      <span className="text-xs text-gray-400">{q.chapter.name}</span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm mb-2">{q.content}</p>
                    
                    {/* Choices Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {q.choices.map((choice) => (
                        <div
                          key={choice.id}
                          className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${
                            choice.id === q.correctChoiceId 
                              ? "bg-green-50 text-green-700 border-green-200 font-medium" 
                              : "border-gray-100 text-gray-600 bg-gray-50/50"
                          }`}
                        >
                          {choice.id === q.correctChoiceId && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                          <span className="font-bold">{choice.label}.</span>
                          <span className="truncate">{choice.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/dashboard/questions/${q.id}/edit`}>
                      <button className="p-2 w-full flex justify-center items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
