"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white border border-[#E5E7EB] rounded-xl h-full">
      <div className="bg-primary/5 p-3 rounded-full mb-4">
        <Icon className="h-6 w-6 text-primary/70" />
      </div>
      <h3 className="text-sm font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-xs text-[#6B7280] max-w-sm mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="h-8 text-xs px-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
