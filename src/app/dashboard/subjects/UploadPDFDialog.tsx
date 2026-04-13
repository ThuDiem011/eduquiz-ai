"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, FileText, Loader2, Play} from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

export function UploadPDFDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Vui lòng chọn file PDF", variant: "error" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/subjects/import-pdf", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast({ title: "Sách đã được AI xử lý và thêm thành công!", variant: "success" });
        setOpen(false);
        setFile(null);
        router.refresh(); // Refresh lại danh sách
      } else {
        toast({ title: "Lỗi xử lý PDF. File quá lớn hoặc không hợp lệ.", variant: "error" });
      }
    } catch (err) {
      toast({ title: "Lỗi kết nối", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 ml-2"
      >
        <FileUp className="w-4 h-4" /> Thêm bằng PDF (AI)
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FileUp className="w-5 h-5 text-orange-500" /> Tải lên SGK (PDF)
            </h2>
            
            <p className="text-sm text-gray-500 mb-6">
              AI sẽ quét nội dung PDF, tự động phân tích Chương / Bài và tạo thư viện câu hỏi mẫu cho bạn.
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  id="pdf-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                  <FileText className={`w-10 h-10 mb-3 ${file ? 'text-orange-500' : 'text-gray-400'}`} />
                  {file ? (
                    <span className="font-medium text-orange-700 text-sm truncate w-full px-4">{file.name}</span>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-900 text-sm">Nhấn để chọn hoặc kéo thả file</span>
                      <span className="text-gray-500 text-xs mt-1">Chỉ hỗ trợ file PDF (Tối đa 50MB)</span>
                    </>
                  )}
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={loading}>
                  Hủy
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" disabled={loading || !file}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI đang đọc...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Xử lý ngay
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
