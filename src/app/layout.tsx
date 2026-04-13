import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: {
    default: "EduQuiz AI – Hệ thống trắc nghiệm kiến thức môn học",
    template: "%s | EduQuiz AI",
  },
  description:
    "Hệ thống trắc nghiệm kiến thức môn học thông minh dành cho giáo viên và học sinh. Tạo đề, làm bài, phân tích kết quả với AI.",
  keywords: ["trắc nghiệm", "kiểm tra", "học sinh", "giáo viên", "EduQuiz", "AI"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduQuiz AI",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
