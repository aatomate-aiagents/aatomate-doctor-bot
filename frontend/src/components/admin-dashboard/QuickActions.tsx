"use client";

import { Role } from "@/lib/rbac";
import { UserProfile } from "@/lib/rbac";
import { UserPlus, CalendarPlus, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  userProfile: UserProfile;
}

export function QuickActions({ userProfile }: QuickActionsProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB]">
        <h2 className="text-base font-semibold text-[#111827]">Quick Actions</h2>
      </div>
      
      <div className="flex-1 p-3 space-y-2">
        <Link 
          href="/admin/users/new?role=doctor"
          className="w-full flex items-center text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] h-10 px-3 rounded-md transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2 text-[#9CA3AF]" />
          Add New Doctor
        </Link>
        
        <Link 
          href="/admin/users/new?role=staff"
          className="w-full flex items-center text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] h-10 px-3 rounded-md transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2 text-[#9CA3AF]" />
          Add New Staff
        </Link>

        {/* Existing routes logic */}
        <Link href="/admin/patients" className="w-full flex items-center text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] h-10 px-3 rounded-md transition-colors">
          <UserPlus className="w-4 h-4 mr-2 text-[#9CA3AF]" />
          Register Patient
        </Link>
        
        <Link href="/admin/appointments" className="w-full flex items-center text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] h-10 px-3 rounded-md transition-colors">
          <CalendarPlus className="w-4 h-4 mr-2 text-[#9CA3AF]" />
          Create Appointment
        </Link>
        
        <Link href="/admin/reports" className="w-full flex items-center justify-between text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] h-10 px-3 rounded-md transition-colors">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-[#9CA3AF]" />
            View Reports
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </Link>
      </div>
    </div>
  );
}
