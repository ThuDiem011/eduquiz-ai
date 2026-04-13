"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus, BookOpen, Clock, Target, Calendar } from "lucide-react";
import { ProgressBar, LoadingSpinner, EmptyState } from "@/components/ui/badge";
import { getMasteryLabel, getMasteryColor, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

export default function PersonalAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics/personal")
      .then(r => r.json())
      .then(d => {
        setData(d.stats);
        setLoading(false);
      })
      .catch(() => {
        toast({ title: "Lỗi tải dữ liệu phân tích", variant: "error" });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) return <EmptyState title="Chưa có dữ liệu" description="Hãy hoàn thành ít nhất 1 bài kiểm tra để có phân tích." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Phân tích học tập cá nhân</h1>
        <p className="text-gray-500 text-sm mt-1">Đo lường tiến bộ và gợi ý lộ trình học tập tối ưu</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Mức độ thành thạo</p>
              <h3 className="text-2xl font-black text-gray-900">{data.overallScore}/100</h3>
            </div>
          </div>
          <div className={`text-xs font-semibold ${getMasteryColor(data.overallScore)}`}>
            {getMasteryLabel(data.overallScore)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              data.trend === "improving" ? "bg-green-100 text-green-600" :
              data.trend === "declining" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
            }`}>
              {data.trend === "improving" ? <TrendingUp className="w-5 h-5" /> :
               data.trend === "declining" ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Xu hướng</p>
              <h3 className="text-sm font-bold text-gray-900 mt-1">
                {data.trend === "improving" ? "Đang tiến bộ" :
                 data.trend === "declining" ? "Đang đi xuống" : "Ổn định"}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Tổng bài làm</p>
              <h3 className="text-2xl font-black text-gray-900">{data.totalAttempts}</h3>
            </div>
          </div>
          <p className="text-xs text-gray-400">bài kiểm tra đã nộp</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Thời gian học</p>
              <h3 className="text-2xl font-black text-gray-900">{Math.round(data.totalTimeMinutes / 60)}h {data.totalTimeMinutes % 60}m</h3>
            </div>
          </div>
          <p className="text-xs text-gray-400">tổng thời gian làm bài</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Điểm mạnh / Điểm yếu */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span>
              Kiến thức điểm mạnh
            </h2>
            <div className="space-y-4">
              {data.strongAreas.map((area: any, i: number) => (
                <ProgressBar
                  key={i}
                  value={area.mastery}
                  label={area.name}
                  color="#10B981"
                  showPercent
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-red-500 rounded-full inline-block"></span>
              Kiến thức cần cải thiện
            </h2>
            <div className="space-y-4">
              {data.weakAreas.map((area: any, i: number) => (
                <ProgressBar
                  key={i}
                  value={area.mastery}
                  label={area.name}
                  color="#EF4444"
                  showPercent
                />
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white h-full relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-2 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-bold text-xl">Chuyên gia AI phân tích</h2>
            </div>

            <div className="space-y-4">
              {data.recommendations.map((rec: string, i: number) => (
                <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex gap-3">
                    <span className="text-purple-300 font-bold mt-0.5">#{i+1}</span>
                    <p className="text-sm leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm text-purple-200">
                Lộ trình của bạn đang đi đúng hướng. Hãy hoàn thành thêm 2 bài tập mức độ khó của "Mã hóa dữ liệu" để đạt mastery nhé!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
