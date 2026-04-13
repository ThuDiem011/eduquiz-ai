"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Save, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { getDifficultyLabel, getCategoryLabel } from "@/lib/utils";

interface GeneratedQuestion {
  content: string;
  choices: { label: string; content: string }[];
  correctLabel: string;
  explanation: string;
  category: string;
  difficulty: string;
  selected?: boolean;
  saving?: boolean;
  saved?: boolean;
}

export default function AIGeneratePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  const [form, setForm] = useState({
    subjectId: "",
    chapterId: "",
    lessonId: "",
    category: "CONCEPT",
    difficulty: "MEDIUM",
    count: 5,
    language: "vi",
    customPrompt: "",
  });

  useEffect(() => {
    fetch("/api/subjects").then(r => r.json()).then(d => setSubjects(d.subjects || []));
  }, []);

  useEffect(() => {
    if (form.subjectId) {
      fetch(`/api/chapters?subjectId=${form.subjectId}`)
        .then(r => r.json())
        .then(d => setChapters(d.chapters || []));
    }
  }, [form.subjectId]);

  useEffect(() => {
    if (form.chapterId) {
      fetch(`/api/lessons?chapterId=${form.chapterId}`)
        .then(r => r.json())
        .then(d => setLessons(d.lessons || []));
    }
  }, [form.chapterId]);

  const handleGenerate = async () => {
    if (!form.subjectId || !form.chapterId) {
      toast({ title: "Vui lòng chọn môn học và chương", variant: "error" });
      return;
    }

    setLoading(true);
    setQuestions([]);

    try {
      const res = await fetch("/api/questions/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setQuestions(data.questions.map((q: any) => ({ ...q, selected: true })));
      toast({ title: `✨ Đã tạo ${data.questions.length} câu hỏi!`, variant: "success" });
    } catch {
      toast({ title: "Lỗi khi tạo câu hỏi", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSelected = async () => {
    const selectedQs = questions.filter(q => q.selected && !q.saved);
    if (selectedQs.length === 0) {
      toast({ title: "Chưa có câu hỏi nào được chọn", variant: "error" });
      return;
    }

    setSaving(true);
    let savedCount = 0;

    for (const q of selectedQs) {
      try {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: form.subjectId,
            chapterId: form.chapterId,
            lessonId: form.lessonId || undefined,
            category: q.category,
            difficulty: q.difficulty,
            content: q.content,
            explanation: q.explanation,
            choices: q.choices,
            correctLabel: q.correctLabel,
            sourceType: "AI_GENERATED",
            status: "APPROVED",
          }),
        });
        if (res.ok) {
          savedCount++;
          setQuestions(prev =>
            prev.map(pq => pq.content === q.content ? { ...pq, saved: true } : pq)
          );
        }
      } catch {}
    }

    setSaving(false);
    toast({ title: `✅ Đã lưu ${savedCount} câu vào ngân hàng!`, variant: "success" });
  };

  const toggleSelect = (index: number) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, selected: !q.selected } : q));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const selectedCount = questions.filter(q => q.selected && !q.saved).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">AI Tạo câu hỏi</h1>
        </div>
        <p className="text-gray-500 text-sm ml-10">Tự động tạo câu hỏi trắc nghiệm bằng AI theo yêu cầu</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 sticky top-6">
            <h2 className="font-bold text-gray-900 text-sm">Yêu cầu tạo câu hỏi</h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Môn học *</label>
              <select
                value={form.subjectId}
                onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, chapterId: "", lessonId: "" }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Chọn môn học...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Chương *</label>
              <select
                value={form.chapterId}
                onChange={e => setForm(f => ({ ...f, chapterId: e.target.value, lessonId: "" }))}
                disabled={!form.subjectId}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              >
                <option value="">Chọn chương...</option>
                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Bài học</label>
              <select
                value={form.lessonId}
                onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                disabled={!form.chapterId}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              >
                <option value="">Tất cả bài</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Loại kiến thức</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CONCEPT">Khái niệm</option>
                  <option value="THEOREM">Định lý</option>
                  <option value="PROPERTY">Tính chất</option>
                  <option value="EXERCISE">Dạng bài tập</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Độ khó</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Số câu hỏi (1-20)</label>
              <input
                type="number"
                min={1} max={20}
                value={form.count}
                onChange={e => setForm(f => ({ ...f, count: +e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Yêu cầu thêm (tùy chọn)</label>
              <textarea
                value={form.customPrompt}
                onChange={e => setForm(f => ({ ...f, customPrompt: e.target.value }))}
                rows={2}
                placeholder="VD: Tập trung câu hỏi về ứng dụng thực tế..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Đang tạo..." : "Tạo câu hỏi với AI"}
            </button>
          </div>
        </div>

        {/* Generated questions */}
        <div className="lg:col-span-3 space-y-4">
          {questions.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {questions.length} câu được tạo · <span className="text-purple-600 font-medium">{selectedCount} được chọn</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                  <RefreshCw className="w-4 h-4" /> Tạo lại
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveSelected}
                  disabled={saving || selectedCount === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu {selectedCount} câu vào ngân hàng
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <p className="font-semibold text-gray-700">AI đang tạo câu hỏi...</p>
              <p className="text-sm text-gray-400 mt-1">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {!loading && questions.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-600">Chưa có câu hỏi nào</p>
              <p className="text-sm text-gray-400 mt-1">Điền thông tin và nhấn "Tạo câu hỏi với AI"</p>
            </div>
          )}

          {questions.map((q, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border-2 p-5 transition-all duration-200 ${
                q.saved ? "border-green-200 bg-green-50/30" :
                q.selected ? "border-purple-300" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="checkbox"
                    checked={q.selected || false}
                    onChange={() => toggleSelect(i)}
                    disabled={q.saved}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    q.difficulty === "EASY" ? "bg-green-100 text-green-700" :
                    q.difficulty === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}>{getDifficultyLabel(q.difficulty)}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {getCategoryLabel(q.category)}
                  </span>
                  {q.saved && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />Đã lưu
                    </span>
                  )}
                </div>
                {!q.saved && (
                  <button onClick={() => removeQuestion(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="font-medium text-gray-900 text-sm mb-3">{q.content}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {q.choices.map((c) => (
                  <div
                    key={c.label}
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                      c.label === q.correctLabel
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-600 bg-gray-50"
                    }`}
                  >
                    <span className="font-bold flex-shrink-0">{c.label}.</span>
                    <span>{c.content}</span>
                    {c.label === q.correctLabel && <CheckCircle2 className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="bg-blue-50 rounded-xl p-2.5 text-xs text-blue-800">
                  <span className="font-semibold">💡 </span>{q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
