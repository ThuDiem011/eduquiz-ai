import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary";
}

const variantClasses = {
  default: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-purple-50 text-purple-700 border-purple-200",
  secondary: "bg-gray-50 text-gray-700 border-gray-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "bg-blue-500", text: "text-blue-600" },
  green: { bg: "bg-green-50", icon: "bg-green-500", text: "text-green-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-500", text: "text-purple-600" },
  orange: { bg: "bg-orange-50", icon: "bg-orange-500", text: "text-orange-600" },
  red: { bg: "bg-red-50", icon: "bg-red-500", text: "text-red-600" },
};

export function StatCard({ title, value, description, icon, trend, color = "blue" }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colors.bg)}>
          <div className={cn("text-white", colors.icon, "[&>svg]:h-5 [&>svg]:w-5")}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
            <span>{trend.value >= 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin",
          sizeMap[size]
        )}
      />
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, max = 100, label, color = "#3B82F6", showPercent = false }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs font-medium text-gray-600">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-gray-500">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
