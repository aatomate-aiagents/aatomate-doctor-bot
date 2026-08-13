"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProfile } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Building2,
  FileText,
  CreditCard,
  Settings,
  Sparkles,
  LogOut,
  BriefcaseMedical
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

interface AdminSidebarProps {
  userProfile: UserProfile;
}

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { name: "Staff", href: "/admin/staff", icon: BriefcaseMedical },
  { name: "Departments", href: "/admin/departments", icon: Building2 },
  { name: "Billing & Payments", href: "/admin/billing", icon: CreditCard },
  { name: "Medical Reports", href: "/admin/reports", icon: FileText },
  { name: "AI Insights", href: "/admin/insights", icon: Sparkles },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ userProfile }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("tenantId");
    localStorage.removeItem("activeRole");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-[#E5E7EB] w-64 flex-shrink-0">
      {/* Top: Logo & Hospital Profile */}
      <div className="flex flex-col p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">Aatomate</span>
        </div>
        
        <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
          <p className="text-sm font-semibold text-[#111827] truncate">
            Hospital Administration
          </p>
          <p className="text-xs text-[#6B7280]">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 flex-shrink-0 h-4 w-4",
                  isActive ? "text-primary" : "text-[#9CA3AF] group-hover:text-[#4B5563]"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom: Admin Profile & Logout */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA]">
        <div className="flex items-center w-full">
          <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-primary/20">
            <AvatarFallback className="text-xs font-medium bg-transparent">
              {userProfile.name?.charAt(0) || userProfile.email?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-[#111827] truncate">
              {userProfile.name || "Admin"}
            </p>
            <p className="text-xs text-[#6B7280] truncate">
              {userProfile.activeRole.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
