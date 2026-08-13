import { RoleGuard } from "@/components/layout/RoleGuard";
import { HospitalAdminLayout } from "@/components/admin-dashboard/HospitalAdminLayout";
import { Role } from "@/lib/rbac";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[Role.HOSPITAL_ADMIN]}>
      <HospitalAdminLayout>
        {children}
      </HospitalAdminLayout>
    </RoleGuard>
  );
}
