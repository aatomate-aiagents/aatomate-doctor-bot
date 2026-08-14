"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role, getRoleDisplayName } from "@/lib/rbac";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  Activity,
  FileText,
  Calendar,
  Pill,
  Microscope,
  Stethoscope,
  LogOut,
  BadgeCheck,
  CheckSquare
} from "lucide-react";

import { UserProfile } from "@/lib/rbac";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getTenants } from "@/lib/api";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileRoleSwitcher } from "./RoleSwitcher";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  category?: string;
}

const getNavigationByRole = (role: Role): SidebarItem[] => {
  switch (role) {
    case Role.SUPER_ADMIN:
      return [
        { name: "Platform Overview", href: "/super-admin", icon: LayoutDashboard },
        { name: "Hospitals", href: "/super-admin/hospitals", icon: Building2 },
        { name: "Users", href: "/super-admin/users", icon: Users },
      ];
    case Role.HOSPITAL_ADMIN:
      return [
        { name: "Hospital Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
        { name: "Staff", href: "/admin/staff", icon: Users },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ];
    case Role.DOCTOR:
      return [
        { name: "My Dashboard", href: "/doctor", icon: LayoutDashboard },
        { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
        { name: "Patients", href: "/doctor/patients", icon: Users },
      ];
    case Role.STAFF:
    case Role.RECEPTIONIST:
    case Role.NURSE:
    case Role.LAB_TECHNICIAN:
    case Role.PHARMACIST:
    case Role.BILLING_EXECUTIVE:
      return [
        // Workspace
        { name: "Dashboard", href: "/staff", icon: LayoutDashboard, category: "Workspace" },
        { name: "Appointments", href: "/staff/appointments", icon: Calendar, category: "Workspace" },
        { name: "Patients", href: "/staff/patients", icon: Users, category: "Workspace" },
        { name: "Walk-in Queue", href: "/staff/queue", icon: Activity, category: "Workspace" },
        // Clinical
        { name: "Reports", href: "/staff/reports", icon: FileText, category: "Clinical" },
        { name: "Prescriptions", href: "/staff/prescriptions", icon: Pill, category: "Clinical" },
        // Operations
        { name: "Payments", href: "/staff/payments", icon: CreditCard, category: "Operations" },
        { name: "Billing", href: "/staff/invoices", icon: FileText, category: "Operations" },
        { name: "Tasks", href: "/staff/tasks", icon: CheckSquare, category: "Operations" },
        // Account
        { name: "Profile & Settings", href: "/staff/settings", icon: Settings, category: "Account" },
      ];
    default:
      return [];
  }
};

export function SidebarContent({ userProfile, onNavigate }: { userProfile: UserProfile, onNavigate?: () => void }) {
  const pathname = usePathname();
  const navigation = getNavigationByRole(userProfile.activeRole);

  // Group by category if present
  const categorizedNav = navigation.reduce((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  const hasCategories = navigation.some(item => item.category);

  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
    enabled: userProfile.tenantId !== "global"
  });
  
  const hospitalName = tenants?.find(t => t.id === userProfile.tenantId)?.hospital_name;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    const ALL_COOKIES = ["vendor_session", "business_session", "staff_session", "super_admin_session", "doctor_session"];
    for (const cookie of ALL_COOKIES) {
      document.cookie = `${cookie}=; path=/; max-age=0`;
    }
    localStorage.removeItem("tenantId");
    localStorage.removeItem("activeRole");
    window.location.href = "/login";
  };

  const renderNavItems = (items: SidebarItem[]) => (
    items.map((item) => {
      // Precise path matching logic
      const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/staff");
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            isActive 
              ? "bg-primary/10 text-primary font-semibold shadow-sm" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
          {item.name}
        </Link>
      );
    })
  );

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 flex-shrink-0 border-b border-sidebar-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 py-1">
          <Image 
            src="/aatomate.jpeg" 
            alt="Aatomate Logo" 
            width={110} 
            height={40} 
            className="object-contain mix-blend-multiply dark:mix-blend-normal"
          />
          {hospitalName && (
            <div className="mt-1 text-center w-full bg-primary/5 px-2 py-1.5 rounded-md border border-primary/10">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Hospital</span>
              <p className="text-sm font-bold text-foreground truncate" title={hospitalName}>{hospitalName}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto scrollbar-hide">
        {hasCategories ? (
          <div className="space-y-6">
            {Object.entries(categorizedNav).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
                  {category}
                </h4>
                {renderNavItems(items)}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {renderNavItems(navigation)}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2 w-full text-sm font-semibold text-destructive hover:text-destructive-foreground transition-colors rounded-md hover:bg-destructive shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function MobileSidebarContent({ userProfile, onNavigate }: { userProfile: UserProfile, onNavigate?: () => void }) {
  const pathname = usePathname();
  const navigation = getNavigationByRole(userProfile.activeRole);
  
  const categorizedNav = navigation.reduce((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  const hasCategories = navigation.some(item => item.category);

  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
    enabled: userProfile.tenantId !== "global"
  });
  
  const hospitalName = tenants?.find(t => t.id === userProfile.tenantId)?.hospital_name;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    const ALL_COOKIES = ["vendor_session", "business_session", "staff_session", "super_admin_session", "doctor_session"];
    for (const cookie of ALL_COOKIES) {
      document.cookie = `${cookie}=; path=/; max-age=0`;
    }
    localStorage.removeItem("tenantId");
    localStorage.removeItem("activeRole");
    window.location.href = "/login";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const renderNavItems = (items: SidebarItem[]) => (
    items.map((item) => {
      const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/staff");
      return (
        <motion.div key={item.name} variants={itemVariants}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-slate-400")} />
            {item.name}
          </Link>
        </motion.div>
      );
    })
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-card text-foreground overflow-hidden">
      <div className="p-6 flex-shrink-0 bg-card border-b border-border shadow-sm relative z-10">
        <div className="flex items-center justify-center mb-6">
          <Image 
            src="/aatomate.jpeg" 
            alt="Aatomate Logo" 
            width={120} 
            height={44} 
            className="object-contain mix-blend-multiply dark:mix-blend-normal"
          />
        </div>
        
        <div className="flex flex-col items-center text-center">
          <h3 className="font-bold text-lg flex items-center gap-1.5 text-foreground">
            {userProfile.name}
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </h3>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            {getRoleDisplayName(userProfile.activeRole)}
          </p>
          {hospitalName && (
            <div className="mt-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/50">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{hospitalName}</span>
            </div>
          )}
        </div>
      </div>

      <MobileRoleSwitcher />

      <motion.nav 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide relative z-0"
      >
        {hasCategories ? (
          <div className="space-y-6">
            {Object.entries(categorizedNav).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <motion.h4 variants={itemVariants} className="px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {category}
                </motion.h4>
                <div className="space-y-1.5">
                  {renderNavItems(items)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {renderNavItems(navigation)}
          </div>
        )}
      </motion.nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="p-6 bg-card border-t border-border flex-shrink-0"
      >
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-destructive border-2 border-destructive/20 bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign Out Securely
        </button>
      </motion.div>
    </div>
  );
}

export function DynamicSidebar({ userProfile }: { userProfile: UserProfile }) {
  return (
    <>
      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent userProfile={userProfile} />
      </div>
      <div className="md:hidden">
        {/* Mobile sidebar handles its own rendering usually, or rely on DashboardLayout */}
      </div>
    </>
  );
}
