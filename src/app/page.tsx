import Link from "next/link";
import {
  GraduationCap, Sparkles, BarChart3, BookOpen, CheckCircle,
  ArrowRight, Users, FileText, Star, ChevronRight, Zap, Shield, Trophy,
  FilePlus2, Clock
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">EduQuiz AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
              Đăng nhập
            </Link>
            <Link href="/register" className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all">
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-purple-200 rounded-full blur-2xl opacity-40 -z-10" />
        <div className="absolute top-60 left-10 w-24 h-24 bg-blue-200 rounded-full blur-2xl opacity-40 -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-blue-700 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Hệ thống trắc nghiệm thông minh với AI</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
            Tạo đề thông minh.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Phân tích sâu sắc.
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            EduQuiz AI giúp giáo viên tạo đề kiểm tra tự động, học sinh làm bài trực tuyến,
            và phân tích kết quả học tập theo từng chương, bài, loại kiến thức.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5"
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              Xem demo
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {[
              { value: "200+", label: "Câu hỏi mẫu" },
              { value: "4 môn", label: "Môn học" },
              { value: "3 vai trò", label: "Admin / Teacher / Student" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Tính năng</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Đầy đủ công cụ giảng dạy</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Từ tạo đề đến phân tích học tập – mọi thứ bạn cần trong một nền tảng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-7 h-7 text-blue-600" />,
                bg: "bg-blue-50",
                title: "Ngân hàng câu hỏi",
                desc: "Xây dựng ngân hàng câu hỏi phân loại theo môn, chương, bài, loại kiến thức và độ khó. Import từ CSV/Excel.",
                features: ["Phân loại 4 loại kiến thức", "3 mức độ khó", "Import/Export CSV"],
              },
              {
                icon: <Sparkles className="w-7 h-7 text-indigo-600" />,
                bg: "bg-indigo-50",
                title: "Tạo đề tự động",
                desc: "Chọn số câu, độ khó, chương/bài – hệ thống tự động lấy câu hỏi phù hợp và tạo đề trong giây lát.",
                features: ["Chọn tỷ lệ dễ/TB/khó", "Trộn câu hỏi & đáp án", "AI tạo câu hỏi mới"],
              },
              {
                icon: <BarChart3 className="w-7 h-7 text-purple-600" />,
                bg: "bg-purple-50",
                title: "Phân tích học tập",
                desc: "Phân tích điểm mạnh/yếu theo từng chương, bài và loại kiến thức. Mastery score và gợi ý ôn tập.",
                features: ["Mastery Score 0-100", "Biểu đồ tiến bộ", "Gợi ý cá nhân hóa"],
              },
            ].map((feat, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">{feat.desc}</p>
                <ul className="space-y-2">
                  {feat.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Quy trình</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">3 bước đơn giản</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 -translate-y-12" />
            {[
              {
                step: "01",
                icon: <FilePlus2 className="w-8 h-8" />,
                color: "from-blue-500 to-blue-600",
                title: "Tạo đề kiểm tra",
                desc: "Giáo viên chọn môn, chương/bài, số câu và độ khó. Hệ thống tự động lấy câu hỏi phù hợp từ ngân hàng.",
              },
              {
                step: "02",
                icon: <BookOpen className="w-8 h-8" />,
                color: "from-indigo-500 to-indigo-600",
                title: "Học sinh làm bài",
                desc: "Học sinh đăng nhập, làm bài với giao diện tập trung, đồng hồ đếm ngược và tự lưu đáp án.",
              },
              {
                step: "03",
                icon: <BarChart3 className="w-8 h-8" />,
                color: "from-purple-500 to-purple-600",
                title: "Phân tích kết quả",
                desc: "Xem điểm số, phân tích điểm mạnh/yếu, nhận gợi ý ôn tập và theo dõi tiến bộ theo thời gian.",
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg mb-6 relative`}>
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs font-black text-gray-700 border-2 border-gray-100 shadow">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Dành cho mọi vai trò</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: "Quản trị viên",
                icon: <Shield className="w-6 h-6" />,
                color: "red",
                features: ["Quản lý toàn bộ hệ thống", "Quản lý người dùng", "Xem thống kê tổng quan", "Quản lý ngân hàng câu hỏi"],
              },
              {
                role: "Giáo viên",
                icon: <Zap className="w-6 h-6" />,
                color: "blue",
                features: ["Tạo đề thủ công & tự động", "AI tạo câu hỏi", "Giao bài cho học sinh", "Phân tích kết quả lớp"],
              },
              {
                role: "Học sinh",
                icon: <Trophy className="w-6 h-6" />,
                color: "green",
                features: ["Làm bài trực tuyến", "Xem kết quả chi tiết", "Phân tích điểm mạnh/yếu", "Nhận gợi ý ôn tập cá nhân"],
              },
            ].map((r, i) => {
              const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
                red: { bg: "bg-red-50 border-red-200", icon: "bg-red-500 text-white", text: "text-red-600" },
                blue: { bg: "bg-blue-50 border-blue-200", icon: "bg-blue-500 text-white", text: "text-blue-600" },
                green: { bg: "bg-green-50 border-green-200", icon: "bg-green-500 text-white", text: "text-green-600" },
              };
              const c = colorMap[r.color];
              return (
                <div key={i} className={`rounded-2xl border-2 p-8 ${c.bg}`}>
                  <div className={`w-12 h-12 rounded-2xl ${c.icon} flex items-center justify-center mb-5`}>
                    {r.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-5 ${c.text}`}>{r.role}</h3>
                  <ul className="space-y-3">
                    {r.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.icon} inline-block`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sẵn sàng trải nghiệm?</h2>
              <p className="text-blue-100 mb-8 text-lg">Đăng nhập ngay với tài khoản demo</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all"
                >
                  Đăng nhập ngay
                </Link>
                <Link
                  href="/register"
                  className="border-2 border-white/50 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-all"
                >
                  Tạo tài khoản
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-blue-100">
                {[
                  { label: "Admin", email: "admin@eduquiz.ai" },
                  { label: "Teacher", email: "teacher1@eduquiz.ai" },
                  { label: "Student", email: "student1@eduquiz.ai" },
                ].map((acc, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3">
                    <p className="font-semibold text-white">{acc.label}</p>
                    <p className="text-xs mt-1 font-mono">{acc.email}</p>
                    <p className="text-xs text-blue-200">Mật khẩu: 123456</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">EduQuiz AI</span>
          </div>
          <p className="text-sm">© 2024 EduQuiz AI – Hệ thống trắc nghiệm kiến thức môn học</p>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>Đồ án tốt nghiệp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
