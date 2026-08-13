"use client";

import { useQuery } from "@tanstack/react-query";
import { getAppointments, getDoctors, getPatients } from "@/lib/api";
import { Calendar, Search } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { EmptyState } from "@/components/admin-dashboard/EmptyState";

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: appointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments
  });

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const isLoading = loadingAppts || loadingDoctors || loadingPatients;

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const doctor = doctors.find(d => d.id === apt.doctor_id);
    const patient = patients.find(p => p.id === apt.patient_id);
    const searchString = `${doctor?.name} ${patient?.name} ${apt.status}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Appointments</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage and view all hospital appointments.</p>
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
              placeholder="Search by patient, doctor, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-5 flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded w-full animate-pulse"></div>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="h-full min-h-[400px]">
              <EmptyState 
                icon={Calendar} 
                title="No appointments found" 
                description={searchTerm ? "Try adjusting your search terms." : "No appointments have been scheduled yet."}
              />
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#FAFAFA] text-xs uppercase text-[#6B7280] border-b border-[#E5E7EB] sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4 font-medium">Date & Time</th>
                  <th className="px-5 py-4 font-medium">Patient</th>
                  <th className="px-5 py-4 font-medium">Doctor</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredAppointments.map((apt) => {
                  const doctor = doctors.find(d => d.id === apt.doctor_id);
                  const patient = patients.find(p => p.id === apt.patient_id);
                  
                  let formattedDate = apt.appointment_date;
                  let formattedTime = apt.appointment_time;
                  try {
                     formattedDate = format(new Date(apt.appointment_date), 'MMM d, yyyy');
                     formattedTime = format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a');
                  } catch(e) {}

                  return (
                    <tr key={apt.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-[#111827] font-medium">{formattedDate}</div>
                        <div className="text-xs text-[#6B7280]">{formattedTime}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827] font-medium">{patient?.name || 'Unknown'}</div>
                        <div className="text-xs text-[#6B7280]">{patient?.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827] font-medium">Dr. {doctor?.name || 'Unknown'}</div>
                        <div className="text-xs text-[#6B7280]">{doctor?.specialization || 'General'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          apt.status === 'scheduled' || apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          apt.status === 'cancelled' || apt.status === 'no_show' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {apt.status.replace('_', ' ').charAt(0).toUpperCase() + apt.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-[#6B7280] max-w-[200px] truncate">
                        {apt.reason || apt.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
