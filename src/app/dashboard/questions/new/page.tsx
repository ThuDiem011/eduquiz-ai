"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

interface Subject { id: string; name: string; }
interface Chapter { id: string; name: string; subjectId: string; }
interface Lesson { id: string; name: string; chapterId: string; }

export default function NewQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [form, setForm] = useState({
    subjectId: "",
    chapterId: "",
    lessonId: "",
    category: "CONCEPT",
    difficulty: "MEDIUM",
    content: "",
    explanation: "",
    status: "APPROVED",
    choices: [
      { label: "A", content: "" },
      { label: "B", content: "" },
      { label: "C", content: "" },
      { label: "D", content: "" },
    ],
    correctLabel: "A",
  });

  useEffect(() => {
    fetch("/api/subjects").then(r => r.json()).then(d => setSubjects(d.subjects || []));
  }, []);

  useEffect(() => {
    if (form.subjectId) {
      fetch(`/api/chapters?subjectId=${form.subjectId}`).then(r => r.json()).then(d => {
        setChapters(d.chapters || []);
        setForm(f => ({ ...f, chapterId: "", lessonId: "" }));
      });
    }
  }, [form.subjectId]);

  useEffect(() => {
    if (form.chapterId) {
      fetch(`/api/lessons?chapterId=${form.chapterId}`).then(r => r.json()).then(d => {
        setLessons(d.lessons || []);
        setForm(f => ({ ...f, lessonId: "" }));
      });
    }
  }, [form.chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.chapterId || !form.content) {
      toast({ title: "Vui lòng điền đầy đủ thông tin", variant: "error" });
      return;
    }
    if (form.choices.some(c => !c.content.trim())) {
      toast({ title: "Vui lòng nhập đầy đủ 4 đáp án", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Đã thêm câu hỏi thành công!", variant: "success" });
      router.push("/dashboard/questions");
    } catch {
      toast({ title: "Lỗi khi thêm câu hỏi", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/questions">
          <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Thêm câu hỏi mới</h1>
          <p className="text-gray-500 text-sm">Tạo câu hỏi trắc nghiệm 4 lựa chọn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classification */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Phân loại câu hỏi</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Môn học *</label>
              <select
                value={form.subjectId}
                onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                required
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn môn học...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chương *</label>
              <select
                value={form.chapterId}
                onChange={e => setForm(f => ({ ...f, chapterId: e.target.value }))}
                required
                disabled={!form.subjectId}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="">Chọn chương...</option>
                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bài học</label>
              <select
                value={form.lessonId}
                onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                disabled={!form.chapterId}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="">Chọn bài học...</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="APPROVED">Đã duyệt</option>
                <option value="DRAFT">Nháp</option>
                <option value="HIDDEN">Ẩn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại kiến thức</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CONCEPT">Khái niệm</option>
                <option value="THEOREM">Định lý</option>
                <option value="PROPERTY">Tính chất</option>
                <option value="EXERCISE">Dạng bài tập</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Độ khó</label>
              <select
                value={form.difficulty}
                onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Nội dung câu hỏi</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Câu hỏi *</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              required
              rows={3}
              placeholder="Nhập nội dung câu hỏi..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giải thích đáp án</label>
            <textarea
              value={form.explanation}
              onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
              rows={2}
              placeholder="Giải thích tại sao đáp án đúng (tùy chọn)..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Choices */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Các lựa chọn đáp án</h2>
          <div className="space-y-3">
            {form.choices.map((choice, i) => (
              <div key={choice.label} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                form.correctLabel === choice.label ? "border-green-400 bg-green-50" : "border-gray-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, correctLabel: choice.label }))}
                  className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0 transition-all ${
                    form.correctLabel === choice.label
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  title="Chọn làm đáp án đúng"
                >
                  {choice.label}
                </button>
                <input
                  value={choice.content}
                  onChange={e => {
                    const newChoices = [...form.choices];
                    newChoices[i] = { ...choice, content: e.target.value };
                    setForm(f => ({ ...f, choices: newChoices }));
                  }}
                  required
                  placeholder={`Nội dung đáp án ${choice.label}...`}
                  className="flex-1 h-10 px-3 bg-transparent border-0 text-sm focus:outline-none text-gray-700"
                />
                {form.correctLabel === choice.label && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Click vào ô chữ cái để chọn đáp án đúng</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard/questions" className="flex-1">
            <Button variant="outline" className="w-full">Hủy</Button>
          </Link>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Đang lưu..." : "Lưu câu hỏi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
