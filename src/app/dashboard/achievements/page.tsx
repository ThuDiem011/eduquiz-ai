"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Zap, Target, BookOpen, Clock, Award, Lock } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trong thực tế sẽ fetch từ API dựa trên lịch sử thật của học sinh
    setTimeout(() => {
      setAchievements([
        {
          id: "first_exam",
          title: "Lần đầu làm bài",
          description: "Hoàn thành bài kiểm tra đầu tiên",
          icon: <Star className="w-6 h-6" />,
          color: "from-yellow-400 to-orange-400",
          unlocked: true,
        },
        {
          id: "perfect_score",
          title: "Hoàn hảo",
          description: "Đạt điểm 10/10 trong một bài kiểm tra",
          icon: <Trophy className="w-6 h-6" />,
          color: "from-amber-400 to-yellow-500",
          unlocked: true,
        },
        {
          id: "speed_demon",
          title: "Tốc độ ánh sáng",
          description: "Hoàn thành bài trong vòng 5 phút",
          icon: <Zap className="w-6 h-6" />,
          color: "from-blue-400 to-cyan-400",
          unlocked: true,
        },
        {
          id: "consistent",
          title: "Chuyên cần",
          description: "Làm bài 7 ngày liên tiếp",
          icon: <Target className="w-6 h-6" />,
          color: "from-green-400 to-emerald-500",
          unlocked: false,
          progress: 4,
          maxProgress: 7,
        },
        {
          id: "bookworm",
          title: "Mọt sách",
          description: "Hoàn thành 5 môn học khác nhau",
          icon: <BookOpen className="w-6 h-6" />,
          color: "from-purple-400 to-indigo-500",
          unlocked: false,
          progress: 2,
          maxProgress: 5,
        },
        {
          id: "marathon",
          title: "Người kiên nhẫn",
          description: "Tích lũy 10 giờ học",
          icon: <Clock className="w-6 h-6" />,
          color: "from-red-400 to-rose-500",
          unlocked: false,
          progress: 450,
          maxProgress: 600,
        },
        {
          id: "master",
          title: "Chinh phục",
          description: "Đạt điểm ≥ 9 trong 10 bài liên tiếp",
          icon: <Award className="w-6 h-6" />,
          color: "from-pink-400 to-fuchsia-500",
          unlocked: false,
          progress: 3,
          maxProgress: 10,
        },
        {
          id: "legend",
          title: "Huyền thoại",
          description: "Đứng top 1 bảng xếp hạng",
          icon: <Trophy className="w-6 h-6" />,
          color: "from-rose-400 to-pink-600",
          unlocked: false,
          progress: 0,
          maxProgress: 1,
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Thành tích</h1>
          <p className="text-gray-500 text-sm mt-1">
            Đã mở khóa <span className="font-bold text-blue-600">{unlockedCount}</span>/{achievements.length} huy hiệu
          </p>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md">
          <Trophy className="w-4 h-4" /> {unlockedCount * 50} XP
        </div>
      </div>

      {/* Progress bar tổng */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Tiến độ tổng thể</span>
          <span className="text-gray-400">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Huy hiệu đã mở */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Đã mở khóa ({unlockedCount})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.filter(a => a.unlocked).map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                {a.icon}
              </div>
              <h3 className="font-bold text-gray-900">{a.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{a.description}</p>
              <div className="mt-3 text-xs font-semibold text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Đã mở khóa
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Huy hiệu chưa mở */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" /> Chưa mở khóa ({achievements.length - unlockedCount})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.filter(a => !a.unlocked).map(a => (
            <div key={a.id} className="bg-gray-50 rounded-2xl border border-gray-200 p-5 opacity-70">
              <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-500">{a.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{a.description}</p>
              {a.progress !== undefined && a.maxProgress !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Tiến độ</span>
                    <span>{a.progress}/{a.maxProgress}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(a.progress / a.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
