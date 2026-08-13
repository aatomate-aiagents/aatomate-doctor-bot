"use client";

import { Role } from "@/lib/rbac";
import { UserProfile } from "@/lib/rbac";
import { Plus } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  userProfile: UserProfile;
}

export function DashboardHeader({ userProfile }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Hospital Overview</h1>
        <p className="text-sm text-[#6B7280] mt-1">A real-time view of your hospital's operations.</p>
      </div>
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/users/new?role=doctor"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Link>
        <Link 
          href="/admin/users/new?role=staff"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Link>
      </div>
    </div>
  );
}
