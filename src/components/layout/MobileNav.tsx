"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Sparkles, 
  BarChart3, 
  Trophy,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "STUDENT";

  const navItems = [
    { label: "Tổng quan", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Đề thi", href: role === "STUDENT" ? "/dashboard/my-exams" : "/dashboard/exams", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Tạo AI", href: "/dashboard/questions/ai-generate", icon: <Sparkles className="w-5 h-5" />, teacherOnly: true },
    { label: "Phân tích", href: role === "STUDENT" ? "/dashboard/analytics/personal" : "/dashboard/analytics/class", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Bảng xếp hạng", href: "/dashboard/leaderboard", icon: <Trophy className="w-5 h-5" /> },
  ].filter(item => !item.teacherOnly || role === "TEACHER" || role === "ADMIN");

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 pb-safe pt-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1.5 py-1 px-2 transition-all duration-300",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                isActive ? "bg-blue-50" : "bg-transparent"
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label === "Tổng quan" ? "Home" : 
                 item.label === "Tạo AI" ? "AI Create" :
                 item.label === "Bảng xếp hạng" ? "Top" : item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
