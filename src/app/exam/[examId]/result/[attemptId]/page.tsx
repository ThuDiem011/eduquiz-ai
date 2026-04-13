"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, XCircle, Clock, Trophy, BarChart3,
  BookOpen, ChevronRight, Home, RotateCcw, ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner, ProgressBar } from "@/components/ui/badge";
import { getDifficultyLabel, getCategoryLabel, getScoreGrade, formatDuration } from "@/lib/utils";

interface AttemptResult {
  id: string;
  score: number;
  percentCorrect: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  durationSeconds: number;
  status: string;
  exam: {
    id: string;
    title: string;
    totalQuestions: number;
    showAnswerAfterSubmit: boolean;
    showExplanationAfterSubmit: boolean;
    subject: { name: string; color: string };
  };
  answers: {
    questionId: string;
    isCorrect: boolean;
    selectedChoiceId: string | null;
    question: {
      content: string;
      difficulty: string;
      category: string;
      correctChoiceId: string;
      explanation: string | null;
      choices: { id: string; label: string; content: string }[];
    };
  }[];
  analysisResult: {
    chapterStats: Record<string, any>;
    lessonStats: Record<string, any>;
    categoryStats: Record<string, any>;
    difficultyStats: Record<string, any>;
    comments: string[];
    suggestions: string[];
  } | null;
}

export default function ResultPage() {
  const { examId, attemptId } = useParams() as { examId: string; attemptId: string };
  const router = useRouter();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "answers" | "analysis">("overview");

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}`)
      .then(r => r.json())
      .then(data => {
        setResult(data.attempt);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy kết quả bài thi</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 block">Về Dashboard</Link>
        </div>
      </div>
    );
  }

  const percent = Math.round((result.percentCorrect || 0) * 100);
  const grade = getScoreGrade(percent);
  const total = result.exam.totalQuestions;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="font-bold text-gray-900 text-sm truncate max-w-xs">{result.exam.title}</h1>
          <span className="text-xs text-gray-400">{result.exam.subject.name}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className={`w-28 h-28 rounded-full border-4 border-white/30 mx-auto flex flex-col items-center justify-center mb-4 bg-white/10`}>
              <span className="text-4xl font-black">{percent}%</span>
              <span className={`text-sm font-bold ${grade.color.replace("text-", "text-")} bg-white px-2 py-0.5 rounded-full`}>{grade.grade}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{grade.label}</h2>
            <p className="text-blue-200 text-sm">{result.exam.title}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Số câu đúng", value: result.correctCount, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: "text-green-600" },
            { label: "Số câu sai", value: result.wrongCount, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "text-red-600" },
            { label: "Thời gian", value: result.durationSeconds ? formatDuration(result.durationSeconds) : "—", icon: <Clock className="w-5 h-5 text-blue-500" />, color: "text-blue-600" },
            { label: "Điểm số", value: `${(result.score || 0).toFixed(1)}/10`, icon: <Trophy className="w-5 h-5 text-yellow-500" />, color: "text-yellow-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "analysis", label: "Phân tích" },
            { id: "answers", label: "Xem đáp án" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && result.analysisResult && (
          <div className="space-y-4">
            {/* Comments */}
            <Card>
              <CardHeader><CardTitle>💬 Nhận xét</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.analysisResult.comments.map((comment, i) => (
                    <p key={i} className="text-sm text-gray-700 py-2 border-b border-gray-50 last:border-0">{comment}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category stats */}
            <Card>
              <CardHeader><CardTitle>📊 Kết quả theo loại kiến thức</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.analysisResult.categoryStats)
                    .filter(([, s]: any) => s.total > 0)
                    .map(([cat, stat]: any) => (
                      <ProgressBar
                        key={cat}
                        value={stat.accuracy * 100}
                        label={`${getCategoryLabel(cat)} (${stat.correct}/${stat.total})`}
                        color={stat.accuracy >= 0.8 ? "#10B981" : stat.accuracy >= 0.5 ? "#F59E0B" : "#EF4444"}
                        showPercent
                      />
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Difficulty stats */}
            <Card>
              <CardHeader><CardTitle>🎯 Kết quả theo độ khó</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.analysisResult.difficultyStats)
                    .filter(([, s]: any) => s.total > 0)
                    .map(([diff, stat]: any) => (
                      <ProgressBar
                        key={diff}
                        value={stat.accuracy * 100}
                        label={`${getDifficultyLabel(diff)} (${stat.correct}/${stat.total})`}
                        color={diff === "EASY" ? "#10B981" : diff === "MEDIUM" ? "#3B82F6" : "#8B5CF6"}
                        showPercent
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "analysis" && result.analysisResult && (
          <div className="space-y-4">
            {/* Chapter stats */}
            <Card>
              <CardHeader><CardTitle>📚 Kết quả theo chương</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.analysisResult.chapterStats).map(([id, stat]: any) => (
                    <ProgressBar
                      key={id}
                      value={stat.accuracy * 100}
                      label={`${stat.name} (${stat.correct}/${stat.total})`}
                      color={stat.accuracy >= 0.8 ? "#10B981" : stat.accuracy >= 0.5 ? "#F59E0B" : "#EF4444"}
                      showPercent
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader><CardTitle>💡 Gợi ý ôn tập</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.analysisResult.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-amber-500 font-bold text-sm flex-shrink-0">#{i + 1}</span>
                      <p className="text-sm text-gray-700">{s}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "answers" && (
          <div className="space-y-4">
            {result.answers.map((answer, i) => {
              const correctChoice = answer.question.choices.find(c => c.id === answer.question.correctChoiceId);
              const selectedChoice = answer.question.choices.find(c => c.id === answer.selectedChoiceId);
              return (
                <div key={answer.questionId} className={`bg-white rounded-2xl border-2 p-5 ${
                  answer.isCorrect ? "border-green-200" : "border-red-200"
                }`}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      answer.isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {answer.isCorrect
                        ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                        : <XCircle className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <p className="font-medium text-gray-900 text-sm leading-relaxed">
                      <span className="text-gray-400 mr-2">Câu {i + 1}.</span>
                      {answer.question.content}
                    </p>
                  </div>

                  <div className="space-y-2 pl-11">
                    {answer.question.choices.map((choice) => {
                      const isCorrect = choice.id === answer.question.correctChoiceId;
                      const isSelected = choice.id === answer.selectedChoiceId;
                      return (
                        <div
                          key={choice.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${
                            isCorrect ? "bg-green-50 text-green-800 font-medium" :
                            isSelected && !isCorrect ? "bg-red-50 text-red-700" :
                            "text-gray-500"
                          }`}
                        >
                          <span className="font-bold">{choice.label}.</span>
                          <span>{choice.content}</span>
                          {isCorrect && <span className="ml-auto text-green-600 font-medium text-xs">✓ Đúng</span>}
                          {isSelected && !isCorrect && <span className="ml-auto text-red-600 text-xs">✗ Bạn chọn</span>}
                        </div>
                      );
                    })}
                    {answer.question.explanation && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">💡 Giải thích</p>
                        <p className="text-xs text-blue-800">{answer.question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
              <Home className="w-4 h-4" /> Về Dashboard
            </button>
          </Link>
          <Link href="/dashboard/analytics/personal">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all">
              <BarChart3 className="w-4 h-4" /> Xem phân tích học tập
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
