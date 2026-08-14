"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, FileText, IndianRupee, Activity, Calendar, Pill, Search, UserPlus, FileUp, ListTodo, Plus, ChevronRight, CheckCircle2, TrendingUp, TrendingDown, Pill as PrescriptionIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAppointments, getLaboratoryTests, getPatients } from "@/lib/api";
import { BookAppointmentModal } from "@/components/modals/BookAppointmentModal";
import { AddPatientModal } from "@/components/modals/AddPatientModal";
import { UploadPrescriptionModal } from "@/components/modals/UploadPrescriptionModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function StaffDashboard() {
  const router = useRouter();

  const { data: appointments, isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments
  });

  const { data: labTests, isLoading: loadingLabs } = useQuery({
    queryKey: ["laboratoryTests"],
    queryFn: getLaboratoryTests
  });

  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const isLoading = loadingAppts || loadingLabs || loadingPatients;

  const todaysAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(a => new Date(a.appointment_date).toDateString() === new Date().toDateString());
  }, [appointments]);

  const waitingQueue = useMemo(() => {
    return todaysAppointments.filter(a => ['scheduled', 'waiting', 'checked-in'].includes(a.status?.toLowerCase() || ''))
                             .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }, [todaysAppointments]);

  const pendingReports = labTests?.filter(l => l.status === 'pending' || l.status === 'in_progress') || [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 max-w-[1400px] mx-auto">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-card p-6 md:p-8 rounded-[24px] border shadow-sm"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Hospital Operations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" /> 
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
           <BookAppointmentModal />
           <AddPatientModal triggerText="Register Patient" />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border shadow-sm hover:shadow-md transition-all bg-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Today's Appts</p>
              </div>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl font-bold text-foreground">
                  {loadingAppts ? <Loader2 className="w-5 h-5 animate-spin" /> : todaysAppointments.length}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border shadow-sm hover:shadow-md transition-all bg-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Waiting Queue</p>
              </div>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl font-bold text-foreground">
                  {loadingAppts ? <Loader2 className="w-5 h-5 animate-spin" /> : waitingQueue.length}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border shadow-sm hover:shadow-md transition-all bg-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Payments</p>
              </div>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-1">
                  {loadingAppts ? <Loader2 className="w-5 h-5 animate-spin" /> : <>₹{waitingQueue.length * 500}</>}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border shadow-sm hover:shadow-md transition-all bg-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Pending Reports</p>
              </div>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl font-bold text-foreground">
                  {loadingLabs ? <Loader2 className="w-5 h-5 animate-spin" /> : pendingReports.length}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column - Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Today's Queue
                </CardTitle>
              </div>
              <Button onClick={() => router.push("/staff/queue")} variant="ghost" size="sm" className="text-primary hover:bg-primary/10 rounded-full h-8">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 flex flex-col items-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Loading queue...</p>
                </div>
              ) : waitingQueue.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Queue is empty</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">No patients are waiting right now. You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {waitingQueue.slice(0, 10).map((appt) => {
                    const patient = patients?.find(p => p.id === appt.patient_id);
                    return (
                      <div key={appt.id} className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[50px]">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{appt.appointment_time}</p>
                            <p className="text-[10px] text-muted-foreground">Today</p>
                          </div>
                          <div className="w-px h-10 bg-border hidden sm:block"></div>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border shadow-sm">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {patient ? patient.name.substring(0, 2).toUpperCase() : 'PT'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                                {patient ? patient.name : "Unnamed Patient"}
                                <Badge variant="outline" className="text-[10px] py-0 h-4">{appt.status}</Badge>
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">ID: {patient?.id?.substring(0,8) || appt.patient_id.substring(0,8)}</span>
                                <span>•</span>
                                <span className="truncate max-w-[150px]">{(appt as any).reason_for_visit || appt.reason || 'Consultation'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/staff/patients/${appt.patient_id}`)} className="h-8 rounded-full text-xs font-medium px-3">
                            View Patient
                          </Button>
                          <Button size="sm" className="h-8 rounded-full text-xs font-medium px-4 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                            Check In
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card className="rounded-[24px] border shadow-sm bg-slate-50 dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => router.push("/staff/appointments")} variant="outline" className="w-full justify-start h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-all font-medium">
                <Calendar className="w-4 h-4 mr-3 text-blue-500" /> Manage Appointments
              </Button>
              <Button onClick={() => router.push("/staff/queue")} variant="outline" className="w-full justify-start h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-all font-medium">
                <UserPlus className="w-4 h-4 mr-3 text-emerald-500" /> Add to Walk-in Queue
              </Button>
              <Button onClick={() => router.push("/staff/prescriptions")} variant="outline" className="w-full justify-start h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-all font-medium">
                <PrescriptionIcon className="w-4 h-4 mr-3 text-purple-500" /> Add Prescription Draft
              </Button>
              <Button onClick={() => router.push("/staff/reports")} variant="outline" className="w-full justify-start h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-all font-medium">
                <FileUp className="w-4 h-4 mr-3 text-amber-500" /> Upload Report
              </Button>
              <Button onClick={() => router.push("/staff/patients")} variant="outline" className="w-full justify-start h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-all font-medium">
                <Users className="w-4 h-4 mr-3 text-primary" /> View Patient Directory
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
