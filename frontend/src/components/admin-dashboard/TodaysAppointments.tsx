"use client";

import { Appointment, Doctor, Patient } from "@/types/api";
import { EmptyState } from "./EmptyState";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface TodaysAppointmentsProps {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  loading: boolean;
}

export function TodaysAppointments({ appointments, doctors, patients, loading }: TodaysAppointmentsProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-[400px]">
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="p-5 flex-1 flex flex-col gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded w-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter for today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.appointment_date === today);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB]">
        <h2 className="text-base font-semibold text-[#111827]">Today's Appointments</h2>
        <Link href="/admin/appointments" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto">
        {todaysAppointments.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title="No appointments today" 
            description="Your schedule is clear for today. New appointments will appear here."
          />
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#FAFAFA] text-xs uppercase text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {todaysAppointments.map((apt) => {
                const doctor = doctors.find(d => d.id === apt.doctor_id);
                const patient = patients.find(p => p.id === apt.patient_id);
                
                // Parse time if possible
                let formattedTime = apt.appointment_time;
                try {
                   formattedTime = format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a');
                } catch(e) {}

                return (
                  <tr key={apt.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#111827]">
                      {formattedTime}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[#111827] font-medium">{patient?.name || 'Unknown'}</div>
                      <div className="text-xs text-[#6B7280]">{patient?.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[#4B5563]">
                      Dr. {doctor?.name || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        apt.status === 'scheduled' || apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        apt.status === 'cancelled' || apt.status === 'no_show' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {apt.status.replace('_', ' ').charAt(0).toUpperCase() + apt.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
