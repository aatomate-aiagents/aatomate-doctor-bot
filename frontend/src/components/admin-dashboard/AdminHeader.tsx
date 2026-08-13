"use client";

import { UserProfile } from "@/lib/rbac";
import { Search, Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminHeaderProps {
  userProfile: UserProfile;
  onMenuClick?: () => void;
}

export function AdminHeader({ userProfile, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        {/* Global Search Bar */}
        <div className="hidden md:flex items-center">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#9CA3AF] group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search patients, doctors, appointments..."
              className="block w-[380px] pl-9 pr-14 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-[#FAFAFA] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[#E5E7EB] bg-white px-1.5 font-mono text-[10px] font-medium text-[#6B7280]">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-5">
        <button className="relative p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors focus:outline-none">
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
          <Bell className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-[#E5E7EB] hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-[#111827] leading-none">
              {userProfile.name || "Admin User"}
            </span>
            <span className="text-xs text-[#6B7280] mt-1 capitalize">
              {userProfile.activeRole.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          <Avatar className="h-8 w-8 bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
            <AvatarFallback className="text-xs font-medium bg-transparent">
              {userProfile.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
