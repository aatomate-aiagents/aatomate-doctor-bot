"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function HospitalAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar userProfile={userProfile} />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0">
          <AdminSidebar userProfile={userProfile} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader 
          userProfile={userProfile} 
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
