"use client";

import { useQuery } from "@tanstack/react-query";
import { getDoctors } from "@/lib/api";
import { Building2, Search, Users } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/admin-dashboard/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors
  });

  // Extract unique departments and map doctors to them
  const departmentMap = doctors.reduce((acc, doctor) => {
    const dept = doctor.specialization || "General Medicine";
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(doctor);
    return acc;
  }, {} as Record<string, typeof doctors>);

  const departments = Object.entries(departmentMap).map(([name, docs]) => ({
    name,
    doctors: docs,
    activeCount: docs.filter(d => d.is_active).length
  })).filter(dept => dept.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Departments</h1>
          <p className="text-sm text-[#6B7280] mt-1">Overview of hospital departments and their respective staff.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#9CA3AF]" />
            </div>
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="text-sm font-medium text-[#6B7280]">
            Total Departments: <span className="text-[#111827]">{departments.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"></div>
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="h-full min-h-[400px]">
              <EmptyState 
                icon={Building2} 
                title="No departments found" 
                description={searchTerm ? "Try adjusting your search terms." : "No doctors with specializations have been added yet."}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5E7EB]">
                    <h3 className="text-lg font-bold text-[#111827] truncate pr-2">{dept.name}</h3>
                    <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center shrink-0">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      {dept.doctors.length} Staff
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Key Doctors</p>
                    <div className="space-y-3 flex-1">
                      {dept.doctors.slice(0, 3).map(doctor => (
                        <div key={doctor.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 bg-[#F3F4F6] border border-[#E5E7EB]">
                            <AvatarFallback className="text-[#4B5563] text-xs font-medium">
                              {doctor.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#111827] truncate">Dr. {doctor.name}</p>
                            <p className="text-xs text-[#6B7280] truncate">{doctor.is_active ? 'Active' : 'Inactive'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {dept.doctors.length > 3 && (
                      <div className="mt-2 text-xs font-medium text-primary text-center pt-2 border-t border-dashed border-[#E5E7EB]">
                        + {dept.doctors.length - 3} more doctor{dept.doctors.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
