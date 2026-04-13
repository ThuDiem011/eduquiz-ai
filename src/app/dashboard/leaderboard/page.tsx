"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Star, User, School, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => {
        setPlayers(d.leaderboard || []);
        setLoading(false);
      })
      .catch(() => {
        toast({ title: "Lỗi tải bảng xếp hạng", variant: "error" });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang tính toán thứ hạng...</p>
      </div>
    );
  }

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className="space-y-10 pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-gray-900 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" /> Bảng Xếp Hạng Toàn Cầu
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Vinh danh những học sinh xuất sắc nhất dựa trên điểm số trung bình và nỗ lực học tập không ngừng.
        </p>
      </div>

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 px-4">
          {/* Rank 2 */}
          {top3[1] && (
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden bg-white shadow-lg">
                  <img src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].id}`} alt={top3[1].fullName} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">2</div>
              </div>
              <div className="text-center bg-white p-4 rounded-t-2xl shadow-sm border border-gray-200 w-48 h-32 flex flex-col justify-end">
                <p className="font-bold text-gray-900 truncate w-full">{top3[1].fullName}</p>
                <p className="text-sm font-black text-blue-600">{top3[1].avgScore}</p>
                <div className="h-4 bg-gray-200 w-full mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          <div className="order-1 md:order-2 flex flex-col items-center scale-110 md:mb-4">
            <div className="relative mb-4">
              <Star className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 animate-pulse fill-yellow-500" />
              <div className="w-28 h-28 rounded-full border-4 border-yellow-400 overflow-hidden bg-white shadow-xl ring-4 ring-yellow-400/20">
                <img src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].id}`} alt={top3[0].fullName} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg">1</div>
            </div>
            <div className="text-center bg-gradient-to-b from-yellow-50 to-white p-5 rounded-t-3xl shadow-md border-x border-t border-yellow-200 w-56 h-40 flex flex-col justify-end">
              <p className="font-black text-gray-900 truncate w-full">{top3[0].fullName}</p>
              <p className="text-xl font-black text-yellow-600">{top3[0].avgScore}</p>
              <p className="text-[10px] text-yellow-700 uppercase font-black tracking-widest mb-1">Thiên tài hệ thống</p>
              <div className="h-5 bg-yellow-200 w-full rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* Rank 3 */}
          {top3[2] && (
            <div className="order-3 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-orange-300 overflow-hidden bg-white shadow-lg">
                  <img src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].id}`} alt={top3[2].fullName} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-orange-300 text-orange-900 w-7 h-7 rounded-full flex items-center justify-center font-bold shadow-md">3</div>
              </div>
              <div className="text-center bg-white p-4 rounded-t-2xl shadow-sm border border-gray-200 w-44 h-28 flex flex-col justify-end">
                <p className="font-bold text-gray-900 truncate w-full">{top3[2].fullName}</p>
                <p className="text-sm font-black text-orange-600">{top3[2].avgScore}</p>
                <div className="h-3 bg-orange-100 w-full mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-300" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List rest of the ranks */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Danh sách xếp hạng</h3>
            <span className="text-xs text-gray-500 font-medium">Top {players.length} thành viên</span>
          </div>
          <div className="divide-y divide-gray-100">
            {rest.length === 0 && top3.length > 0 && <p className="p-10 text-center text-sm text-gray-400">Chưa có thêm thành viên nào trong danh sách.</p>}
            {rest.map((player, index) => (
              <div key={player.id} className="p-4 flex items-center gap-4 hover:bg-blue-50/30 transition-colors group">
                <div className="w-8 text-center font-black text-gray-400 group-hover:text-blue-500">{index + 4}</div>
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`} alt={player.fullName} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{player.fullName}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <School className="w-3 h-3" /> {player.school || "Chưa cập nhật trường"}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{player.avgScore}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">{player.totalAttempts} bài làm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
