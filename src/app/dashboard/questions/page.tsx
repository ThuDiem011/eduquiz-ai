"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Plus, Download, Upload, Eye, Edit2, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, LoadingSpinner } from "@/components/ui/badge";
import { getDifficultyLabel, getCategoryLabel, getDifficultyColor, getCategoryColor, formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";

interface Question {
  id: string;
  content: string;
  category: string;
  difficulty: string;
  status: string;
  sourceType: string;
  subject: { name: string; color: string };
  chapter: { name: string };
  lesson?: { name: string };
  choices: { id: string; label: string; content: string }[];
  correctChoiceId: string;
  explanation?: string;
  createdBy: { fullName: string };
  createdAt: string;
  _count: { studentAnswers: number };
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    subjectId: "",
    chapterId: "",
    category: "",
    difficulty: "",
    status: "",
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      const res = await fetch(`/api/questions?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    fetch("/api/subjects").then(r => r.json()).then(d => setSubjects(d.subjects || []));
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Đã xóa câu hỏi", variant: "success" });
      fetchQuestions();
    }
    setDeleteId(null);
  };

  const handleDuplicate = async (q: Question) => {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: q.subject.name,
        content: "[Bản sao] " + q.content,
        choices: q.choices,
        correctLabel: q.choices.find(c => c.id === q.correctChoiceId)?.label,
        category: q.category,
        difficulty: q.difficulty,
      }),
    });
    if (res.ok) {
      toast({ title: "Đã nhân bản câu hỏi", variant: "success" });
      fetchQuestions();
    }
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Nội dung", "Môn", "Chương", "Loại", "Độ khó", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", "Đáp án đúng"],
      ...questions.map(q => [
        q.id, q.content, q.subject.name, q.chapter.name, getCategoryLabel(q.category), getDifficultyLabel(q.difficulty),
        q.choices[0]?.content, q.choices[1]?.content, q.choices[2]?.content, q.choices[3]?.content,
        q.choices.find(c => c.id === q.correctChoiceId)?.label,
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cau-hoi.csv";
    a.click();
    toast({ title: "Đã xuất file CSV", variant: "success" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Ngân hàng câu hỏi</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng cộng <strong>{total}</strong> câu hỏi</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Xuất CSV
          </Button>
          <Link href="/dashboard/questions/import">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4" /> Nhập CSV
            </Button>
          </Link>
          <Link href="/dashboard/questions/ai-generate">
            <Button variant="secondary" size="sm" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-0">
              ✨ AI tạo câu hỏi
            </Button>
          </Link>
          <Link href="/dashboard/questions/new">
            <Button size="sm">
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="col-span-2 lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={filters.search}
                onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.subjectId}
              onChange={e => { setFilters(f => ({ ...f, subjectId: e.target.value })); setPage(1); }}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả môn</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={filters.category}
              onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả loại</option>
              <option value="CONCEPT">Khái niệm</option>
              <option value="THEOREM">Định lý</option>
              <option value="PROPERTY">Tính chất</option>
              <option value="EXERCISE">Dạng bài tập</option>
            </select>
            <select
              value={filters.difficulty}
              onChange={e => { setFilters(f => ({ ...f, difficulty: e.target.value })); setPage(1); }}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả độ khó</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
            <select
              value={filters.status}
              onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="DRAFT">Nháp</option>
              <option value="HIDDEN">Ẩn</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : questions.length === 0 ? (
        <EmptyState
          title="Không có câu hỏi nào"
          description="Thêm câu hỏi vào ngân hàng để bắt đầu"
          action={<Link href="/dashboard/questions/new"><Button>Thêm câu hỏi</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-mono text-gray-400">#{(page - 1) * 15 + i + 1}</span>
                    <Badge variant={q.status === "APPROVED" ? "success" : q.status === "DRAFT" ? "warning" : "secondary"}>
                      {q.status === "APPROVED" ? "Đã duyệt" : q.status === "DRAFT" ? "Nháp" : "Ẩn"}
                    </Badge>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getDifficultyColor(q.difficulty)}`}>
                      {getDifficultyLabel(q.difficulty)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(q.category)}`}>
                      {getCategoryLabel(q.category)}
                    </span>
                    <span className="text-xs text-gray-400">{q.subject.name} · {q.chapter.name}</span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{q.content}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {q.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`flex items-center gap-2 text-xs p-1.5 rounded-lg ${
                          choice.id === q.correctChoiceId ? "bg-green-50 text-green-700 font-medium" : "text-gray-500"
                        }`}
                      >
                        {choice.id === q.correctChoiceId && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                        {choice.id !== q.correctChoiceId && <span className="w-3" />}
                        <span className="font-bold">{choice.label}.</span>
                        <span className="truncate">{choice.content}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setSelectedQuestion(q)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link href={`/dashboard/questions/${q.id}/edit`}>
                    <button className="p-2 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    title="Nhân bản"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(q.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">Trang {page} / {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQuestion(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết câu hỏi</h2>
              <button onClick={() => setSelectedQuestion(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant={selectedQuestion.status === "APPROVED" ? "success" : "warning"}>
                  {selectedQuestion.status === "APPROVED" ? "Đã duyệt" : "Nháp"}
                </Badge>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {getDifficultyLabel(selectedQuestion.difficulty)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getCategoryColor(selectedQuestion.category)}`}>
                  {getCategoryLabel(selectedQuestion.category)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{selectedQuestion.subject.name} · {selectedQuestion.chapter.name} {selectedQuestion.lesson ? `· ${selectedQuestion.lesson.name}` : ""}</p>
                <p className="font-semibold text-gray-900">{selectedQuestion.content}</p>
              </div>
              <div className="space-y-2">
                {selectedQuestion.choices.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      c.id === selectedQuestion.correctChoiceId
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <span className={`font-bold text-sm flex-shrink-0 ${c.id === selectedQuestion.correctChoiceId ? "text-green-600" : "text-gray-500"}`}>
                      {c.label}.
                    </span>
                    <span className="text-sm text-gray-700">{c.content}</span>
                    {c.id === selectedQuestion.correctChoiceId && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 ml-auto mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
              {selectedQuestion.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">💡 Giải thích</p>
                  <p className="text-sm text-blue-800">{selectedQuestion.explanation}</p>
                </div>
              )}
              <p className="text-xs text-gray-400">Tạo bởi: {selectedQuestion.createdBy.fullName} · {formatDate(selectedQuestion.createdAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-500 mb-6">Bạn có chắc muốn xóa câu hỏi này? Thao tác không thể hoàn tác.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Hủy</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteId)}>Xóa</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
