import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getDifficultyLabel(difficulty: string): string {
  const map: Record<string, string> = {
    EASY: "Dễ",
    MEDIUM: "Trung bình",
    HARD: "Khó",
  };
  return map[difficulty] || difficulty;
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    CONCEPT: "Khái niệm",
    THEOREM: "Định lý",
    PROPERTY: "Tính chất",
    EXERCISE: "Dạng bài tập",
  };
  return map[category] || category;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Nháp",
    APPROVED: "Đã duyệt",
    HIDDEN: "Ẩn",
    IN_PROGRESS: "Đang làm",
    SUBMITTED: "Đã nộp",
    EXPIRED: "Quá hạn",
  };
  return map[status] || status;
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN: "Quản trị viên",
    TEACHER: "Giáo viên",
    STUDENT: "Học sinh",
  };
  return map[role] || role;
}

export function getMasteryLabel(score: number): string {
  if (score < 40) return "Chưa nắm";
  if (score < 60) return "Đang hình thành";
  if (score < 80) return "Khá";
  return "Thành thạo";
}

export function getMasteryColor(score: number): string {
  if (score < 40) return "text-red-500";
  if (score < 60) return "text-orange-500";
  if (score < 80) return "text-yellow-500";
  return "text-green-500";
}

export function getScoreGrade(percent: number): {
  grade: string;
  label: string;
  color: string;
} {
  if (percent >= 90) return { grade: "A+", label: "Xuất sắc", color: "text-green-600" };
  if (percent >= 80) return { grade: "A", label: "Giỏi", color: "text-green-500" };
  if (percent >= 65) return { grade: "B", label: "Khá", color: "text-blue-500" };
  if (percent >= 50) return { grade: "C", label: "Trung bình", color: "text-yellow-500" };
  if (percent >= 35) return { grade: "D", label: "Yếu", color: "text-orange-500" };
  return { grade: "F", label: "Kém", color: "text-red-500" };
}

export function getDifficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    EASY: "text-green-600 bg-green-50 border-green-200",
    MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
    HARD: "text-red-600 bg-red-50 border-red-200",
  };
  return map[difficulty] || "";
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    CONCEPT: "text-blue-600 bg-blue-50 border-blue-200",
    THEOREM: "text-purple-600 bg-purple-50 border-purple-200",
    PROPERTY: "text-teal-600 bg-teal-50 border-teal-200",
    EXERCISE: "text-orange-600 bg-orange-50 border-orange-200",
  };
  return map[category] || "";
}

export function calculateMasteryScore(
  correct: number,
  total: number,
  difficulty: "EASY" | "MEDIUM" | "HARD" = "MEDIUM",
  progressBonus: number = 0
): number {
  if (total === 0) return 0;
  const weights = { EASY: 1, MEDIUM: 1.5, HARD: 2 };
  const weight = weights[difficulty];
  const baseAccuracy = correct / total;
  const weightedScore = baseAccuracy * weight * 50;
  const bonus = Math.min(progressBonus * 5, 10);
  return Math.min(100, Math.round(weightedScore + bonus));
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
