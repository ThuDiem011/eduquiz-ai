"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, Flag, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface Choice {
  id: string;
  label: string;
  content: string;
}

interface Question {
  id: string;
  content: string;
  choices: Choice[];
  category: string;
  difficulty: string;
}

interface ExamData {
  id: string;
  title: string;
  durationMinutes: number;
  showAnswerAfterSubmit: boolean;
  totalQuestions: number;
  examQuestions: { question: Question; orderIndex: number }[];
}

export default function ExamPage() {
  const { examId } = useParams() as { examId: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId → choiceId
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const savedAnswers = useRef<Record<string, string>>({});

  // Load exam
  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examId }),
        });
        if (!res.ok) {
          toast({ title: "Không thể bắt đầu bài thi", variant: "error" });
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        setExam(data.exam);
        setAttemptId(data.attemptId);
        setTimeLeft(data.exam.durationMinutes * 60);

        // Restore saved answers
        const saved = localStorage.getItem(`exam-${data.attemptId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAnswers(parsed);
          savedAnswers.current = parsed;
        }
      } catch {
        toast({ title: "Lỗi kết nối", variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    startExam();
  }, [examId, router]);

  // Timer
  useEffect(() => {
    if (!exam || timeLeft <= 0 || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [exam, submitted]);

  // Auto-save
  const autoSave = useCallback((newAnswers: Record<string, string>) => {
    if (attemptId) {
      localStorage.setItem(`exam-${attemptId}`, JSON.stringify(newAnswers));
    }
  }, [attemptId]);

  const handleAnswer = (questionId: string, choiceId: string) => {
    const newAnswers = { ...answers, [questionId]: choiceId };
    setAnswers(newAnswers);
    autoSave(newAnswers);
  };

  const handleFlag = (questionId: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleSubmit = async (auto = false) => {
    if (!attemptId || submitting || submitted) return;

    setSubmitting(true);
    setShowConfirm(false);
    clearInterval(timerRef.current!);

    try {
      const answerList = Object.entries(answers).map(([questionId, selectedChoiceId]) => ({
        questionId,
        selectedChoiceId,
      }));

      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerList }),
      });

      if (!res.ok) throw new Error("Submit failed");

      // Clear saved answers
      localStorage.removeItem(`exam-${attemptId}`);
      setSubmitted(true);

      if (auto) {
        toast({ title: "⏰ Hết giờ! Bài đã được nộp tự động", variant: "warning" });
      } else {
        toast({ title: "✅ Nộp bài thành công!", variant: "success" });
      }

      router.push(`/exam/${examId}/result/${attemptId}`);
    } catch {
      toast({ title: "Lỗi khi nộp bài. Vui lòng thử lại.", variant: "error" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-500">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const questions = exam.examQuestions
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(eq => eq.question);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const timerColor = timeLeft < 300 ? "text-red-600 bg-red-50" : timeLeft < 600 ? "text-orange-600 bg-orange-50" : "text-blue-600 bg-blue-50";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{exam.title}</p>
              <p className="text-xs text-gray-400">{questions.length} câu hỏi</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timerColor} transition-colors`}>
            <Clock className="w-5 h-5" />
            {formatDuration(timeLeft)}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-md transition-all disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            Nộp bài
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Main question area */}
        <div className="flex-1 min-w-0">
          {currentQuestion && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              {/* Question header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Câu {currentIndex + 1} / {questions.length}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        currentQuestion.difficulty === "EASY" ? "bg-green-100 text-green-700" :
                        currentQuestion.difficulty === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {currentQuestion.difficulty === "EASY" ? "Dễ" : currentQuestion.difficulty === "MEDIUM" ? "Trung bình" : "Khó"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1 text-xs px-3 py-2 rounded-xl font-medium transition-all ${
                    flagged.has(currentQuestion.id)
                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                      : "bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flagged.has(currentQuestion.id) ? "Đã đánh dấu" : "Đánh dấu"}
                </button>
              </div>

              {/* Question content */}
              <div className="text-gray-900 font-medium text-base leading-relaxed mb-8">
                {currentQuestion.content}
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {currentQuestion.choices.map((choice) => {
                  const isSelected = answers[currentQuestion.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswer(currentQuestion.id, choice.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}>
                        {choice.label}
                      </div>
                      <span className={`text-sm leading-relaxed pt-1.5 ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}>
                        {choice.content}
                      </span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-auto mt-1.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" /> Câu trước
                </Button>
                <span className="text-sm text-gray-500">
                  {answeredCount}/{questions.length} câu đã trả lời
                </span>
                <Button
                  variant={currentIndex < questions.length - 1 ? "default" : "outline"}
                  onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIndex === questions.length - 1}
                >
                  Câu sau <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Question palette - right sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-24">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Danh sách câu hỏi</h3>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-blue-600" /><span>Đã trả lời</span></div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-orange-400" /><span>Đánh dấu</span></div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border-2 border-gray-300" /><span>Chưa trả lời</span></div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged.has(q.id);
                const isCurrent = i === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all duration-200 
                      ${isCurrent ? "ring-2 ring-offset-1 ring-blue-500 scale-110" : ""}
                      ${isFlagged ? "bg-orange-400 text-white" :
                        isAnswered ? "bg-blue-600 text-white" :
                        "border-2 border-gray-200 text-gray-500 hover:border-blue-300"
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tiến độ</span>
                <span>{answeredCount}/{questions.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-md transition-all"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Xác nhận nộp bài</h3>
                <p className="text-sm text-gray-500">Bạn có chắc muốn nộp bài không?</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Đã trả lời:</span>
                <span className="font-semibold text-green-600">{answeredCount} câu</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Chưa trả lời:</span>
                <span className="font-semibold text-red-600">{questions.length - answeredCount} câu</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Đánh dấu xem lại:</span>
                <span className="font-semibold text-orange-600">{flagged.size} câu</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Thời gian còn lại:</span>
                <span className="font-mono font-bold">{formatDuration(timeLeft)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                Tiếp tục làm bài
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? "Đang nộp..." : "Nộp bài"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
