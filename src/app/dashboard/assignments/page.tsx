"use client";

import { useState, useEffect } from "react";
import { UserCheck, Plus, Calendar, Clock, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, LoadingSpinner } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({ examId: "", studentId: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assnRes, examsRes, usersRes] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/exams"),
        fetch("/api/users?role=STUDENT") // Assuming this API exists, otherwise we'll gracefully fallback
      ]);
      const assnData = await assnRes.json();
      const examsData = await examsRes.json();
      
      let usersData = { users: [] };
      if (usersRes.ok) { usersData = await usersRes.json(); }
      
      setAssignments(assnData.assignments || []);
      setExams(examsData.exams || []);
      setStudents(usersData.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast({ title: "Đã giao bài thành công", variant: "success" });
        setOpenModal(false);
        fetchData();
      } else {
        toast({ title: "Lỗi giao bài", variant: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Giao bài tập / Đề thi</h1>
          <p className="text-gray-500 text-sm mt-1">Phân công đề thi cho học sinh hoặc lớp</p>
        </div>
        <Button onClick={() => setOpenModal(true)} className="flex items-center gap-2 bg-blue-600">
          <Plus className="w-4 h-4" /> Giao bài mới
        </Button>
      </div>

      {loading ? <LoadingSpinner className="py-20" /> : assignments.length === 0 ? (
        <EmptyState title="Chưa có bài tập được giao" description="Bấm 'Giao bài mới' để chọn một đề thi giao cho học sinh" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(assn => (
            <Card key={assn.id} className="hover:border-blue-200 transition-colors">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Badge variant={assn.status === "ACTIVE" ? "success" : "secondary"} className="mb-2">
                      {assn.status === "ACTIVE" ? "Đang mở" : "Đã đóng"}
                    </Badge>
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2">{assn.exam?.title || "Đề thi không xác định"}</h3>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <span>Giao cho: <strong className="text-gray-900">{assn.student?.fullName || assn.class?.name || "Tất cả"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Thời lượng: <strong>{assn.exam?.durationMinutes} phút</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span>Ngày giao: {new Date(assn.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Giao bài thi mới</h2>
              <button onClick={() => setOpenModal(false)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Chọn đề thi *</label>
                <select required value={form.examId} onChange={e => setForm({...form, examId: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-gray-200">
                  <option value="">-- Click để chọn đề thi --</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Giao cho Học sinh (hoặc bỏ trống mặc định)</label>
                <select value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-gray-200">
                  <option value="">Tất cả / Chưa chọn</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="outline" type="button" className="flex-1" onClick={() => setOpenModal(false)}>Hủy</Button>
                <Button type="submit" className="flex-1 bg-blue-600" disabled={submitting || !form.examId}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Giao bài
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
