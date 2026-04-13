"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      if (urlError === "Configuration") {
        setError("Lỗi cấu hình hệ thống (NextAuth). Hãy kiểm tra AUTH_URL.");
      } else if (urlError === "CredentialsSignin") {
        setError("Email hoặc mật khẩu không đúng.");
      } else {
        setError(`Lỗi đăng nhập: ${urlError}`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Use default redirect behavior for cross-device stability
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: true,
    });
  };

  const quickLogin = async (email: string) => {
    setLoading(true);
    setError("");
    await signIn("credentials", {
      email,
      password: "123456",
      callbackUrl: "/dashboard",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="font-black text-xl text-gray-900">EduQuiz AI</p>
              <p className="text-xs text-gray-400 -mt-0.5">Trắc nghiệm thông minh</p>
            </div>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 text-sm mb-8">Chào mừng bạn trở lại!</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 mb-4">Đăng nhập nhanh với tài khoản demo</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Admin", email: "admin@eduquiz.ai", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" },
                { label: "Teacher", email: "teacher1@eduquiz.ai", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
                { label: "Student", email: "student1@eduquiz.ai", color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.email)}
                  disabled={loading}
                  className={`border rounded-xl py-2 px-3 text-xs font-semibold transition-all ${acc.color} disabled:opacity-50`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">Mật khẩu: <code className="font-mono font-bold">123456</code></p>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
