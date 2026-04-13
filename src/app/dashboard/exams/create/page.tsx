"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Wand2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { getDifficultyLabel, getCategoryLabel } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface Subject { id: string; name: string; }
interface Chapter { id: string; name: string; }
interface Lesson { id: string; name: string; }

export default function CreateExamPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    chapterId: "",
    lessonId: "",
    mode: "PRACTICE",
    durationMinutes: 45,
    totalQuestions: 20,
    shuffleQuestions: true,
    shuffleChoices: false,
    showAnswerAfterSubmit: true,
    showExplanationAfterSubmit: true,
    passingScore: 50,
    // Auto generation settings
    easyPercent: 40,
    mediumPercent: 40,
    hardPercent: 20,
    categories: [] as string[],
  });

  useEffect(() => {
    fetch("/api/subjects").then(r => r.json()).then(d => setSubjects(d.subjects || []));
  }, []);

  useEffect(() => {
    if (form.subjectId) {
      fetch(`/api/chapters?subjectId=${form.subjectId}`).then(r => r.json()).then(d => setChapters(d.chapters || []));
    }
  }, [form.subjectId]);

  useEffect(() => {
    if (form.chapterId) {
      fetch(`/api/lessons?chapterId=${form.chapterId}`).then(r => r.json()).then(d => setLessons(d.lessons || []));
    }
  }, [form.chapterId]);

  // Check available questions
  useEffect(() => {
    if (form.subjectId) {
      const params = new URLSearchParams({
        subjectId: form.subjectId,
        ...(form.chapterId ? { chapterId: form.chapterId } : {}),
        status: "APPROVED",
        limit: "1000",
      });
      fetch(`/api/questions?${params}`)
        .then(r => r.json())
        .then(d => setAvailableCount(d.total || 0));
    }
  }, [form.subjectId, form.chapterId]);

  const handleAutoGenerate = async () => {
    setAutoLoading(true);
    try {
      const params = new URLSearchParams({
        subjectId: form.subjectId,
        ...(form.chapterId ? { chapterId: form.chapterId } : {}),
        ...(form.lessonId ? { lessonId: form.lessonId } : {}),
        status: "APPROVED",
        limit: "200",
      });
      const res = await fetch(`/api/questions?${params}`);
      const data = await res.json();
      const allQuestions = data.questions || [];

      if (allQuestions.length < form.totalQuestions) {
        toast({
          title: `Chỉ có ${allQuestions.length} câu hỏi phù hợp (cần ${form.totalQuestions})`,
          variant: "warning",
        });
      }

      // Select by difficulty ratio
      const easyQs = allQuestions.filter((q: any) => q.difficulty === "EASY");
      const mediumQs = allQuestions.filter((q: any) => q.difficulty === "MEDIUM");
      const hardQs = allQuestions.filter((q: any) => q.difficulty === "HARD");

      const easyCount = Math.round(form.totalQuestions * form.easyPercent / 100);
      const mediumCount = Math.round(form.totalQuestions * form.mediumPercent / 100);
      const hardCount = form.totalQuestions - easyCount - mediumCount;

      const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

      const selected = [
        ...shuffle(easyQs).slice(0, easyCount),
        ...shuffle(mediumQs).slice(0, mediumCount),
        ...shuffle(hardQs).slice(0, hardCount),
      ].slice(0, form.totalQuestions);

      setSelectedQuestions(selected);
      setStep(3);
    } finally {
      setAutoLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast({ title: "Vui lòng nhập tên đề", variant: "error" });
      return;
    }
    if (selectedQuestions.length === 0) {
      toast({ title: "Chưa có câu hỏi nào được chọn", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          questionIds: selectedQuestions.map(q => q.id),
        }),
      });

      if (!res.ok) throw new Error();
      const exam = await res.json();
      toast({ title: "Tạo đề thành công!", variant: "success" });
      router.push(`/dashboard/exams/${exam.id}`);
    } catch {
      toast({ title: "Lỗi khi tạo đề", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Chọn môn học", number: 1 },
    { label: "Cài đặt đề", number: 2 },
    { label: "Xem trước câu hỏi", number: 3 },
    { label: "Xác nhận tạo", number: 4 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/exams">
          <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tạo đề kiểm tra</h1>
          <p className="text-gray-500 text-sm">Tạo đề tự động từ ngân hàng câu hỏi</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-4">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.number ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step > s.number ? "bg-blue-600 text-white" :
                step === s.number ? "bg-blue-100 text-blue-600 border-2 border-blue-600" :
                "bg-gray-100 text-gray-400"
              }`}>
                {step > s.number ? "✓" : s.number}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${step > s.number ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Subject & Scope */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Chọn phạm vi kiến thức</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Môn học *</label>
              <select
                value={form.subjectId}
                onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, chapterId: "", lessonId: "" }))}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn môn học...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chương</label>
                <select
                  value={form.chapterId}
                  onChange={e => setForm(f => ({ ...f, chapterId: e.target.value, lessonId: "" }))}
                  disabled={!form.subjectId}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Tất cả chương</option>
                  {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bài học</label>
                <select
                  value={form.lessonId}
                  onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                  disabled={!form.chapterId}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Tất cả bài</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {availableCount !== null && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
              availableCount >= form.totalQuestions
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-orange-50 text-orange-700 border border-orange-200"
            }`}>
              {availableCount >= form.totalQuestions
                ? <CheckCircle2 className="w-4 h-4" />
                : <AlertCircle className="w-4 h-4" />
              }
              Có {availableCount} câu hỏi đã duyệt phù hợp
            </div>
          )}

          <Button
            onClick={() => setStep(2)}
            disabled={!form.subjectId}
            className="w-full"
          >
            Tiếp theo
          </Button>
        </div>
      )}

      {/* Step 2: Exam settings */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Thông tin đề kiểm tra</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đề *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="VD: Kiểm tra 45 phút – Chương 1"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thời gian (phút)</label>
                <input
                  type="number"
                  min={5} max={180}
                  value={form.durationMinutes}
                  onChange={e => setForm(f => ({ ...f, durationMinutes: +e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số câu hỏi</label>
                <input
                  type="number"
                  min={1} max={100}
                  value={form.totalQuestions}
                  onChange={e => setForm(f => ({ ...f, totalQuestions: +e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chế độ</label>
                <select
                  value={form.mode}
                  onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PRACTICE">Luyện tập</option>
                  <option value="OFFICIAL">Kiểm tra chính thức</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Điểm đạt (%)</label>
                <input
                  type="number"
                  min={0} max={100}
                  value={form.passingScore}
                  onChange={e => setForm(f => ({ ...f, passingScore: +e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              {[
                { key: "shuffleQuestions", label: "Trộn thứ tự câu hỏi" },
                { key: "shuffleChoices", label: "Trộn đáp án" },
                { key: "showAnswerAfterSubmit", label: "Hiển thị đáp án sau khi nộp" },
                { key: "showExplanationAfterSubmit", label: "Hiển thị giải thích sau khi nộp" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      form[key as keyof typeof form] ? "bg-blue-600" : "bg-gray-300"
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${
                        form[key as keyof typeof form] ? "translate-x-4.5 ml-0.5" : "ml-0.5"
                      }`} style={{ transform: form[key as keyof typeof form] ? "translateX(16px)" : "translateX(2px)" }} />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty ratio */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Tỷ lệ độ khó</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "easyPercent", label: "Dễ (%)", color: "text-green-600" },
                { key: "mediumPercent", label: "Trung bình (%)", color: "text-yellow-600" },
                { key: "hardPercent", label: "Khó (%)", color: "text-red-600" },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <label className={`block text-sm font-medium mb-1.5 ${color}`}>{label}</label>
                  <input
                    type="number"
                    min={0} max={100}
                    value={form[key as keyof typeof form] as number}
                    onChange={e => setForm(f => ({ ...f, [key]: +e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Tổng: {form.easyPercent + form.mediumPercent + form.hardPercent}%
              {form.easyPercent + form.mediumPercent + form.hardPercent !== 100 && (
                <span className="text-red-500 ml-2">(Nên bằng 100%)</span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Quay lại</Button>
            <Button
              onClick={handleAutoGenerate}
              disabled={autoLoading || !form.subjectId}
              className="flex-1"
            >
              {autoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {autoLoading ? "Đang tạo đề..." : "Tự động chọn câu hỏi"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview questions */}
      {step === 3 && selectedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Xem trước – {selectedQuestions.length} câu hỏi</h2>
              <div className="flex gap-2 text-xs">
                {["EASY", "MEDIUM", "HARD"].map(diff => {
                  const count = selectedQuestions.filter(q => q.difficulty === diff).length;
                  return count > 0 ? (
                    <span key={diff} className={`px-2 py-1 rounded-full font-medium ${
                      diff === "EASY" ? "bg-green-100 text-green-700" :
                      diff === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                      {getDifficultyLabel(diff)}: {count}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedQuestions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{q.content}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        q.difficulty === "EASY" ? "bg-green-100 text-green-700" :
                        q.difficulty === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>{getDifficultyLabel(q.difficulty)}</span>
                      <span className="text-xs text-gray-400">{q.chapter?.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedQuestions(prev => prev.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Quay lại</Button>
            <Button onClick={() => setStep(4)} className="flex-1">Xác nhận tạo đề</Button>
          </div>
        </div>
      )}

      {/* Step 4: Final review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Xác nhận tạo đề</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Tên đề", value: form.title || "(Chưa đặt tên)" },
                { label: "Số câu hỏi", value: selectedQuestions.length },
                { label: "Thời gian", value: `${form.durationMinutes} phút` },
                { label: "Chế độ", value: form.mode === "PRACTICE" ? "Luyện tập" : "Kiểm tra chính thức" },
                { label: "Trộn câu hỏi", value: form.shuffleQuestions ? "Có" : "Không" },
                { label: "Hiển thị đáp án", value: form.showAnswerAfterSubmit ? "Có" : "Không" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-900">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Quay lại</Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Đang tạo..." : "✅ Tạo đề"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
