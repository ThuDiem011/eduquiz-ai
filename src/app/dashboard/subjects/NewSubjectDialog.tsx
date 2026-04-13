"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

export function NewSubjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          color: "from-blue-500 to-indigo-600",
          icon: "BookOpen"
        }),
      });

      if (!res.ok) throw new Error("Failed to create subject");
      
      toast({ title: "Đã thêm môn học thành công!", variant: "success" });
      setOpen(false);
      setForm({ name: "", description: "" });
      router.refresh();
    } catch (error) {
      toast({ title: "Lỗi khi thêm môn học", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" /> Thêm môn học
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Thêm Môn học mới</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học / Tựa sách *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Toán 12, Tin học..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tuỳ chọn)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Nhập mô tả ngắn gọn..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-xs flex items-start gap-2">
                <span className="text-lg">💡</span>
                <p>Hệ thống sẽ <strong>tự động tạo một Chương mặc định</strong> để bạn có thể thêm Câu hỏi ngay sau khi tạo xong sách.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" className="flex-1" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Đang tạo..." : "Xác nhận tạo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
