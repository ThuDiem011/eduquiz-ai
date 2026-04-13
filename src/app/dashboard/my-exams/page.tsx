"use client";

import { useState, useEffect } from "react";
import { BookMarked, Play, Clock, CheckCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, EmptyState, LoadingSpinner } from "@/components/ui/badge";
import Link from "next/link";

export default function MyExamsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data.assignments || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bài thi được giao</h1>
        <p className="text-gray-500 text-sm mt-1">Danh sách các bài luyện tập và kiểm tra bạn cần hoàn thành</p>
      </div>

      {loading ? <LoadingSpinner className="py-20" /> : assignments.length === 0 ? (
        <EmptyState title="Chưa có bài tập nào" description="Bạn đã hoàn thành hoặc chưa được giao bài tập mới nào. Tuyệt vời!" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(assn => (
            <Card key={assn.id} className="hover:border-blue-300 transition-all hover:shadow-md">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex-1">
                  <Badge variant={assn.status === "ACTIVE" ? "success" : "secondary"} className="mb-3">
                    {assn.status === "ACTIVE" ? "Đang mở" : "Đã đóng"}
                  </Badge>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2">{assn.exam?.title}</h3>
                  <div className="space-y-1 mb-4 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><BookMarked className="w-4 h-4 text-blue-500"/> Mã đề thi: {assn.exam?.id.slice(-6).toUpperCase()}</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500"/> Thời gian: {assn.exam?.durationMinutes} phút</p>
                    <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Số câu: {assn.exam?.totalQuestions} câu</p>
                  </div>
                </div>
                
                <Link href={`/exam/${assn.examId}?assignmentId=${assn.id}`} className="mt-4 block">
                  <button 
                    disabled={assn.status !== "ACTIVE"}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-medium transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400"
                  >
                    <Play className="w-4 h-4" /> Bắt đầu làm bài
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
