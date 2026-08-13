"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export function MetricCard({ title, value, subtitle, trend, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-[13px] font-semibold text-[#6B7280]">{title}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-[#111827]">{value}</span>
      </div>
      {subtitle && (
        <p className={cn(
          "text-xs mt-2 font-medium",
          trend === 'up' ? "text-emerald-600" :
          trend === 'down' ? "text-rose-600" :
          "text-[#6B7280]"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
