"use client";

import { MetricCard } from "./MetricCard";

interface MetricCardsProps {
  todaysAppointments: number;
  patientsToday: number;
  activeDoctors: number;
  revenue: number;
  loading: boolean;
}

export function MetricCards({ 
  todaysAppointments, 
  patientsToday, 
  activeDoctors, 
  revenue, 
  loading 
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <MetricCard 
        title="Today's Appointments" 
        value={todaysAppointments} 
        subtitle="Scheduled for today" 
        trend="neutral"
        loading={loading}
      />
      <MetricCard 
        title="Patients Today" 
        value={patientsToday} 
        subtitle="Expected today" 
        trend="neutral"
        loading={loading}
      />
      <MetricCard 
        title="Active Doctors" 
        value={activeDoctors} 
        subtitle="Currently available" 
        trend="neutral"
        loading={loading}
      />
      <MetricCard 
        title="Revenue" 
        value={`₹${revenue.toLocaleString('en-IN')}`} 
        subtitle="Estimated total" 
        trend="up"
        loading={loading}
      />
    </div>
  );
}
