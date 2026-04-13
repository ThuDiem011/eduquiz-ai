"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, Bell, Palette, Save, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications">("profile");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    school: "",
    className: "",
  });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  const handleSave = async () => {
    // Demo: shimmer save effect
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "profile" as const, label: "Thông tin cá nhân", icon: <User className="w-4 h-4" /> },
    { id: "password" as const, label: "Đổi mật khẩu", icon: <Lock className="w-4 h-4" /> },
    { id: "notifications" as const, label: "Thông báo", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Cài đặt tài khoản</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin và tùy chỉnh tài khoản của bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-black shadow">
              {(form.fullName || session?.user?.name || "U")[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{form.fullName || session?.user?.name}</p>
              <p className="text-xs text-gray-400">{session?.user?.email}</p>
              <span className="mt-1 inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                {session?.user?.role === "ADMIN" ? "Quản trị" : session?.user?.role === "TEACHER" ? "Giáo viên" : "Học sinh"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trường học</label>
              <input
                type="text"
                value={form.school}
                onChange={e => setForm(p => ({ ...p, school: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Tên trường"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              saved
                ? "bg-green-500 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {saved ? <><CheckCircle className="w-4 h-4" /> Đã lưu!</> : <><Save className="w-4 h-4" /> Lưu thay đổi</>}
          </button>
        </div>
      )}

      {/* Password tab */}
      {activeTab === "password" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="bg-blue-50 text-blue-700 text-sm rounded-xl p-4 flex gap-2">
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Mật khẩu phải có ít nhất 6 ký tự và không trùng mật khẩu cũ.</span>
          </div>
          {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((label, i) => {
            const key = (["current", "next", "confirm"] as const)[i];
            return (
              <div key={label}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <input
                  type="password"
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            );
          })}
          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              saved ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {saved ? <><CheckCircle className="w-4 h-4" /> Đã đổi!</> : <><Lock className="w-4 h-4" /> Đổi mật khẩu</>}
          </button>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          {[
            { label: "Thông báo bài mới được giao", desc: "Khi giáo viên giao bài kiểm tra mới", default: true },
            { label: "Nhắc nhở hạn nộp bài", desc: "Nhắc nhở 1 ngày trước khi đề đóng", default: true },
            { label: "Kết quả điểm số", desc: "Khi có điểm sau khi nộp bài", default: true },
            { label: "Email hàng tuần", desc: "Tóm tắt kết quả học tập hàng tuần", default: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
          <button onClick={handleSave} className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${saved ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
            {saved ? <><CheckCircle className="w-4 h-4" /> Đã lưu!</> : <><Save className="w-4 h-4" /> Lưu cài đặt</>}
          </button>
        </div>
      )}
    </div>
  );
}
