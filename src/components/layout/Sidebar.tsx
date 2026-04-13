"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BookOpen, Layers, FileQuestion, Sparkles,
  FilePlus2, ClipboardList, UserCheck, BarChart3, Users,
  Settings, LogOut, ChevronRight, GraduationCap, Brain,
  BookMarked, Trophy, X, Menu
} from "lucide-react";
import React, { useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: string;
}

const menuItems: MenuItem[] = [
  { label: "Tổng quan", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, roles: ["ADMIN", "TEACHER", "STUDENT"] },

  // Teacher & Admin
  { label: "Môn học", href: "/dashboard/subjects", icon: <BookOpen className="w-5 h-5" />, roles: ["ADMIN", "TEACHER"] },
  { label: "Chương / Bài", href: "/dashboard/chapters", icon: <Layers className="w-5 h-5" />, roles: ["ADMIN", "TEACHER"] },
  { label: "Ngân hàng câu hỏi", href: "/dashboard/questions", icon: <FileQuestion className="w-5 h-5" />, roles: ["ADMIN", "TEACHER"] },
  { label: "Tạo câu hỏi AI", href: "/dashboard/questions/ai-generate", icon: <Sparkles className="w-5 h-5" />, roles: ["TEACHER"] },
  { label: "Tạo đề", href: "/dashboard/exams/create", icon: <FilePlus2 className="w-5 h-5" />, roles: ["TEACHER"] },
  { label: "Danh sách đề", href: "/dashboard/exams", icon: <ClipboardList className="w-5 h-5" />, roles: ["TEACHER"] },
  { label: "Giao bài", href: "/dashboard/assignments", icon: <UserCheck className="w-5 h-5" />, roles: ["TEACHER"] },
  { label: "Kết quả học sinh", href: "/dashboard/results", icon: <BarChart3 className="w-5 h-5" />, roles: ["TEACHER"] },
  { label: "Phân tích lớp học", href: "/dashboard/analytics/class", icon: <Brain className="w-5 h-5" />, roles: ["TEACHER"] },

  // Student
  { label: "Bài được giao", href: "/dashboard/my-exams", icon: <BookMarked className="w-5 h-5" />, roles: ["STUDENT"] },
  { label: "Lịch sử làm bài", href: "/dashboard/history", icon: <ClipboardList className="w-5 h-5" />, roles: ["STUDENT"] },
  { label: "Phân tích học tập", href: "/dashboard/analytics/personal", icon: <BarChart3 className="w-5 h-5" />, roles: ["STUDENT"] },
  { label: "Thành tích", href: "/dashboard/achievements", icon: <Trophy className="w-5 h-5" />, roles: ["STUDENT"] },

  // Admin
  { label: "Quản lý người dùng", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" />, roles: ["ADMIN"] },
  { label: "Thống kê hệ thống", href: "/dashboard/admin/stats", icon: <BarChart3 className="w-5 h-5" />, roles: ["ADMIN"] },

  { label: "Bảng xếp hạng", href: "/dashboard/leaderboard", icon: <Trophy className="w-5 h-5" />, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { label: "Cài đặt", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" />, roles: ["ADMIN", "TEACHER", "STUDENT"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "STUDENT";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredMenu = menuItems.filter((item) => !item.roles || item.roles.includes(role));

  const roleLabels: Record<string, string> = {
    ADMIN: "Quản trị viên",
    TEACHER: "Giáo viên",
    STUDENT: "Học sinh",
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    TEACHER: "bg-blue-100 text-blue-700",
    STUDENT: "bg-green-100 text-green-700",
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-6 py-5 border-b border-gray-100", collapsed && "justify-center px-4")}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">EduQuiz AI</p>
            <p className="text-xs text-gray-400">Trắc nghiệm thông minh</p>
          </div>
        )}
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {session?.user?.name?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{session?.user?.name}</p>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleColors[role])}>
                {roleLabels[role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <span className={cn("flex-shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600")}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={cn("px-3 py-4 border-t border-gray-100", collapsed && "flex justify-center")}>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200",
            collapsed && "justify-center w-auto"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 sticky top-0 flex-shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow-md transition-all duration-200"
        >
          <ChevronRight className={cn("w-3 h-3 transition-transform duration-300", collapsed ? "" : "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Sidebar Trigger - Hidden because we have Bottom Nav */}
      <button
        onClick={() => setMobileOpen(true)}
        className="hidden lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-white border border-gray-200 rounded-xl items-center justify-center shadow-sm"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-50 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
