"use client";

import { Role } from "@/lib/rbac";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { UserProfile } from "@/lib/rbac";
import { Plus } from "lucide-react";

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
        {/* We use the existing AddUserModal to preserve working CRUD functionality */}
        <AddUserModal 
          fixedRole={Role.DOCTOR} 
          fixedTenantId={userProfile.tenantId} 
          triggerText="+ Add Doctor" 
        />
        <AddUserModal 
          fixedRole={Role.STAFF} 
          fixedTenantId={userProfile.tenantId} 
          triggerText="+ Add Staff" 
        />
      </div>
    </div>
  );
}
