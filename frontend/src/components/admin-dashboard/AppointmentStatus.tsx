"use client";

import { Appointment } from "@/types/api";

interface AppointmentStatusProps {
  appointments: Appointment[];
  loading: boolean;
}

export function AppointmentStatus({ appointments, loading }: AppointmentStatusProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-full animate-pulse p-5">
        <div className="h-5 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-32 h-32 rounded-full border-8 border-gray-100 mb-6"></div>
          <div className="w-full space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.appointment_date === today);
  const total = todaysAppointments.length;

  const counts = {
    scheduled: todaysAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
    pending: todaysAppointments.filter(a => a.status === 'pending' || a.status === 'waiting').length,
    completed: todaysAppointments.filter(a => a.status === 'completed').length,
    cancelled: todaysAppointments.filter(a => a.status === 'cancelled' || a.status === 'no_show').length,
  };

  const getPercent = (count: number) => total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col h-full shadow-sm">
      <h2 className="text-base font-semibold text-[#111827] mb-6">Appointment Status</h2>
      
      <div className="flex flex-col flex-1 justify-center">
        {/* Simple Progress Visualization */}
        <div className="w-full h-4 bg-[#F3F4F6] rounded-full overflow-hidden flex mb-8">
          {total === 0 ? (
            <div className="w-full bg-[#E5E7EB]"></div>
          ) : (
            <>
              <div style={{ width: `${getPercent(counts.completed)}%` }} className="bg-emerald-500 h-full" title="Completed"></div>
              <div style={{ width: `${getPercent(counts.scheduled)}%` }} className="bg-blue-500 h-full" title="Confirmed"></div>
              <div style={{ width: `${getPercent(counts.pending)}%` }} className="bg-amber-500 h-full" title="Pending"></div>
              <div style={{ width: `${getPercent(counts.cancelled)}%` }} className="bg-rose-500 h-full" title="Cancelled"></div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-4">
          <StatusRow label="Confirmed" count={counts.scheduled} percent={getPercent(counts.scheduled)} colorClass="bg-blue-500" />
          <StatusRow label="Pending/Waiting" count={counts.pending} percent={getPercent(counts.pending)} colorClass="bg-amber-500" />
          <StatusRow label="Completed" count={counts.completed} percent={getPercent(counts.completed)} colorClass="bg-emerald-500" />
          <StatusRow label="Cancelled" count={counts.cancelled} percent={getPercent(counts.cancelled)} colorClass="bg-rose-500" />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, count, percent, colorClass }: { label: string, count: number, percent: number, colorClass: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
        <span className="text-[#4B5563]">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-[#111827]">{count}</span>
        <span className="text-xs text-[#9CA3AF] w-8 text-right">{percent}%</span>
      </div>
    </div>
  );
}
