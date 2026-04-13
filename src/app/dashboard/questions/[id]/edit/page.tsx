"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

interface Subject { id: string; name: string; }
interface Chapter { id: string; name: string; subjectId: string; }
interface Lesson { id: string; name: string; chapterId: string; }

export default function EditQuestionPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    choices: [] as { id?: string; label: string; content: string }[],
    correctLabel: "A",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          fetch(`/api/questions/${id}`),
          fetch("/api/subjects")
        ]);
        const qData = await qRes.json();
        const sData = await sRes.json();
        
        setSubjects(sData.subjects || []);
        
        const question = qData;
        setForm({
          subjectId: question.subjectId,
          chapterId: question.chapterId,
          lessonId: question.lessonId || "",
          category: question.category,
          difficulty: question.difficulty,
          content: question.content,
          explanation: question.explanation || "",
          status: question.status,
          choices: question.choices,
          correctLabel: question.choices.find((c: any) => c.id === question.correctChoiceId)?.label || "A"
        });

        // Load chapters & lessons
        const [chRes, lsRes] = await Promise.all([
          fetch(`/api/chapters?subjectId=${question.subjectId}`),
          fetch(`/api/lessons?chapterId=${question.chapterId}`)
        ]);
        const chData = await chRes.json();
        const lsData = await lsRes.json();
        
        setChapters(chData.chapters || []);
        setLessons(lsData.lessons || []);
        
        setLoading(false);
      } catch (error) {
        toast({ title: "Lỗi tải dữ liệu câu hỏi", variant: "error" });
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (form.subjectId && !loading) {
      fetch(`/api/chapters?subjectId=${form.subjectId}`).then(r => r.json()).then(d => {
        setChapters(d.chapters || []);
      });
    }
  }, [form.subjectId]);

  useEffect(() => {
    if (form.chapterId && !loading) {
      fetch(`/api/lessons?chapterId=${form.chapterId}`).then(r => r.json()).then(d => {
        setLessons(d.lessons || []);
      });
    }
  }, [form.chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Đã cập nhật câu hỏi!", variant: "success" });
      router.push("/dashboard/questions");
    } catch {
      toast({ title: "Lỗi khi cập nhật câu hỏi", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/questions">
          <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Chỉnh sửa câu hỏi</h1>
          <p className="text-gray-500 text-sm">Cập nhật thông tin và đáp án</p>
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
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chương *</label>
              <select
                value={form.chapterId}
                onChange={e => setForm(f => ({ ...f, chapterId: e.target.value }))}
                required
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm"
              >
                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Question content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Nội dung câu hỏi</h2>
          <div>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giải thích</label>
            <textarea
              value={form.explanation}
              onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center flex-shrink-0 ${
                    form.correctLabel === choice.label ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}
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
                  className="flex-1 h-10 px-3 bg-transparent border-0 text-sm focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Đang lưu..." : "Cập nhật thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
