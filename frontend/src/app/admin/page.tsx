"use client";

import { useQuery } from "@tanstack/react-query";
import { getAppointments, getDoctors, getPatients, getUsers } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/rbac";
import { DashboardHeader } from "@/components/admin-dashboard/DashboardHeader";
import { MetricCards } from "@/components/admin-dashboard/MetricCards";
import { TodaysAppointments } from "@/components/admin-dashboard/TodaysAppointments";
import { AppointmentStatus } from "@/components/admin-dashboard/AppointmentStatus";
import { DoctorOverview } from "@/components/admin-dashboard/DoctorOverview";
import { RecentActivity } from "@/components/admin-dashboard/RecentActivity";
import { QuickActions } from "@/components/admin-dashboard/QuickActions";

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const { data: appointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments
  });

  // Calculate Metrics
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointmentsList = appointments.filter(a => a.appointment_date === today);
  
  const todaysAppointmentsCount = todaysAppointmentsList.length;
  
  // Unique patients seen today
  const patientsTodaySet = new Set(todaysAppointmentsList.map(a => a.patient_id));
  const patientsTodayCount = patientsTodaySet.size;

  // Active doctors
  const activeDoctorsCount = doctors.filter(d => d.is_active).length;

  // Revenue calculation based on existing logic (completed appts * 500)
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const estimatedRevenue = completedAppts * 500;

  const isLoading = loadingDoctors || loadingPatients || loadingAppts;

  if (!userProfile) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <DashboardHeader userProfile={userProfile} />

      {/* KPI Section */}
      <MetricCards 
        todaysAppointments={todaysAppointmentsCount}
        patientsToday={patientsTodayCount}
        activeDoctors={activeDoctorsCount}
        revenue={estimatedRevenue}
        loading={isLoading}
      />

      {/* Main Grid 1: Appointments & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <TodaysAppointments 
            appointments={appointments}
            doctors={doctors}
            patients={patients}
            loading={isLoading}
          />
        </div>
        <div>
          <AppointmentStatus 
            appointments={appointments}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Main Grid 2: Doctors, Activity, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-10">
        <div className="lg:col-span-1">
          <DoctorOverview 
            doctors={doctors}
            appointments={appointments}
            loading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity 
            patients={patients}
            appointments={appointments}
            loading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <QuickActions userProfile={userProfile} />
        </div>
      </div>
      
    </div>
  );
}
