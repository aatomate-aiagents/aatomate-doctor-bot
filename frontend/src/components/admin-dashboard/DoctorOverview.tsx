"use client";

import { Doctor, Appointment } from "@/types/api";
import { EmptyState } from "./EmptyState";
import { Stethoscope, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DoctorOverviewProps {
  doctors: Doctor[];
  appointments: Appointment[];
  loading: boolean;
}

export function DoctorOverview({ doctors, appointments, loading }: DoctorOverviewProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-[350px]">
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-5 flex-1 flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB]">
        <h2 className="text-base font-semibold text-[#111827]">Doctor Overview</h2>
        <Link href="/admin/doctors" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto p-5">
        {doctors.length === 0 ? (
          <EmptyState 
            icon={Stethoscope} 
            title="No doctors added yet" 
            description="Add your first doctor to start managing appointments and availability."
          />
        ) : (
          <div className="space-y-4">
            {doctors.slice(0, 5).map((doctor) => {
              const todaysApptsCount = appointments.filter(a => a.doctor_id === doctor.id && a.appointment_date === today).length;
              
              return (
                <div key={doctor.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-[#F3F4F6] border border-[#E5E7EB]">
                      <AvatarFallback className="text-[#4B5563] text-xs font-medium">
                        {doctor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Dr. {doctor.name}</p>
                      <p className="text-xs text-[#6B7280]">{doctor.specialization || "General"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#111827]">{todaysApptsCount} <span className="text-[#6B7280] font-normal text-xs">appts</span></p>
                    <p className="text-[11px] font-medium text-emerald-600">Available</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
