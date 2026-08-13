"use client";

import { Patient, Appointment } from "@/types/api";
import { User, CalendarCheck, Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  patients: Patient[];
  appointments: Appointment[];
  loading: boolean;
}

export function RecentActivity({ patients, appointments, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-[350px]">
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-5 flex-1 flex flex-col gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-2 mt-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-2 bg-gray-100 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Synthesize activity log from real data
  const activities = [
    ...patients.map(p => ({
      id: `p-${p.id}`,
      type: 'patient_registered',
      title: 'New patient registered',
      description: `${p.name} was added to the system`,
      date: new Date(p.created_at),
      icon: User,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100'
    })),
    ...appointments.map(a => ({
      id: `a-${a.id}`,
      type: 'appointment_booked',
      title: 'Appointment booked',
      description: `New appointment scheduled for ${a.appointment_date}`,
      date: new Date(a.created_at),
      icon: CalendarCheck,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB]">
        <h2 className="text-base font-semibold text-[#111827]">Recent Activity</h2>
      </div>
      
      <div className="flex-1 overflow-auto p-5">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#6B7280]">
            <Activity className="h-6 w-6 mb-2 text-[#9CA3AF]" />
            <p className="text-sm">No recent activity found.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E5E7EB] before:to-transparent">
            {activities.map((activity, i) => (
              <div key={activity.id} className="relative flex items-start gap-4">
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white flex-shrink-0 ${activity.colorClass}`}>
                  <activity.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-[#111827]">{activity.title}</p>
                  <p className="text-xs text-[#6B7280] truncate mt-0.5">{activity.description}</p>
                </div>
                <div className="flex items-center text-[10px] text-[#9CA3AF] whitespace-nowrap pt-1.5 flex-shrink-0">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(activity.date, { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
