"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Filter, Phone, CheckCircle2, Clock, CalendarX, Plus, Stethoscope, ChevronRight, Activity, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointments, getPatients } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookAppointmentModal } from "@/components/modals/BookAppointmentModal";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: appointments, isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments
  });

  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: any }) => {
      const response = await fetch(`/api/v1/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Appointment status updated");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    }
  });

  const isLoading = loadingAppts || loadingPatients;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const sortedAppointments = useMemo(() => {
    let filtered = appointments || [];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(appt => {
        const patient = patients?.find(p => p.id === appt.patient_id);
        return (patient?.name?.toLowerCase().includes(lowerQuery)) || 
               (patient?.phone?.includes(lowerQuery)) ||
               ((appt as any).reason?.toLowerCase().includes(lowerQuery)) ||
               ((appt as any).reason_for_visit?.toLowerCase().includes(lowerQuery)) ||
               (appt.patient_id.toLowerCase().includes(lowerQuery));
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(appt => (appt.status as string) === statusFilter);
    }

    return filtered.slice().sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
  }, [appointments, patients, searchQuery, statusFilter]);

  const totalAppts = appointments || [];
  const completedTotal = totalAppts.filter(a => (a.status as string) === 'completed').length;
  const pendingTotal = totalAppts.filter(a => (a.status as string) === 'scheduled' || (a.status as string) === 'waiting' || (a.status as string) === 'checked-in').length;
  const activeAppt = totalAppts.find(a => (a.status as string) === 'in_consultation');

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-10 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-card p-6 rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
             <CalendarX className="w-8 h-8 text-blue-500 hidden sm:block" /> Appointments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage your consultations and upcoming schedule.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button onClick={() => router.push('/doctor/settings?tab=availability')} variant="outline" className="h-10 rounded-full font-medium shadow-sm hover:bg-slate-50">
             <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Manage Schedule
           </Button>
           <BookAppointmentModal trigger={
             <Button className="h-10 rounded-full font-medium shadow-sm bg-blue-600 hover:bg-blue-700 text-white px-5">
               <Plus className="w-4 h-4 mr-2" /> Book Appt
             </Button>
           } />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-950 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock className="w-16 h-16" />
            </div>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <CalendarX className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Total Scheduled</p>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalAppts.length}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-950 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-16 h-16" />
            </div>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Loader2 className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Waiting / Pending</p>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : pendingTotal}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-950 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Completed</p>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : completedTotal}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[20px] border-indigo-200 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-all bg-indigo-50 dark:bg-indigo-950/20 overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-center h-full">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-400">Current Status</p>
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
               </div>
               {activeAppt ? (
                 <div>
                    <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 truncate">
                      {patients?.find(p => p.id === activeAppt.patient_id)?.name || "In Consultation"}
                    </h3>
                    <p className="text-xs text-indigo-700/70 mt-1 font-medium">{activeAppt.appointment_time}</p>
                 </div>
               ) : (
                 <div className="text-indigo-700/70 font-medium mt-1">No active consultation.</div>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Table Card */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-[24px] overflow-hidden bg-white dark:bg-slate-950">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by patient name, phone..." 
              className="pl-9 h-11 rounded-full bg-white dark:bg-slate-900 border-slate-200 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Filter className="w-4 h-4" /> Filter:
            </div>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-[150px] h-11 rounded-full bg-white dark:bg-slate-900 shadow-sm font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in_consultation">In Consultation</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-500 font-medium">Loading appointments...</p>
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <CalendarX className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Appointments Found</h3>
              <p className="text-slate-500 mt-2 max-w-sm">No scheduled consultations match your current search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[300px] font-semibold text-slate-600 pl-6 h-12">Patient Information</TableHead>
                  <TableHead className="font-semibold text-slate-600 h-12">Time Slot</TableHead>
                  <TableHead className="font-semibold text-slate-600 h-12">Reason</TableHead>
                  <TableHead className="font-semibold text-slate-600 h-12">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600 pr-6 h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAppointments.map((appt) => {
                  const patient = patients?.find(p => p.id === appt.patient_id);
                  const isConsulting = (appt.status as string) === 'in_consultation';
                  
                  return (
                    <TableRow key={appt.id} className={`border-b border-slate-100 dark:border-slate-800/50 transition-colors ${isConsulting ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-11 w-11 border-2 ${isConsulting ? 'border-blue-500' : 'border-white dark:border-slate-800'} shadow-sm`}>
                            <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">
                              {patient?.name?.substring(0, 2).toUpperCase() || 'PT'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {patient ? patient.name : "Unnamed Patient"}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                              {patient?.phone && <span className="flex items-center gap-1 font-medium"><Phone className="w-3 h-3" /> {patient.phone}</span>}
                              <span>• ID: {patient?.id?.substring(0,6) || appt.patient_id.substring(0,6)}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                           {appt.appointment_time}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-medium">
                           {new Date(appt.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                            {(appt as any).reason_for_visit || (appt as any).reason || 'Consultation'}
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          (appt.status as string) === 'completed' ? 'success' : 
                          (appt.status as string) === 'cancelled' ? 'destructive' : 
                          (appt.status as string) === 'waiting' || (appt.status as string) === 'checked-in' ? 'secondary' : 
                          (appt.status as string) === 'in_consultation' ? 'default' : 'default'
                        } className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${(appt.status as string) === 'in_consultation' ? 'bg-blue-500' : ''}`}>
                          {appt.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2 items-center">
                          {(appt.status as string) === 'waiting' && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: appt.id, status: 'in_consultation' })} className="h-8 rounded-full text-xs font-medium px-4 shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
                              Start Consult
                            </Button>
                          )}
                          {(appt.status as string) === 'in_consultation' && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: appt.id, status: 'completed' })} className="h-8 rounded-full text-xs font-medium px-4 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                              Finish
                            </Button>
                          )}
                          {(appt.status as string) === 'scheduled' && (
                             <Button size="sm" onClick={() => updateStatus.mutate({ id: appt.id, status: 'cancelled' })} variant="outline" className="h-8 rounded-full text-xs font-medium px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200">
                               <X className="w-3.5 h-3.5" />
                             </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/doctor/patients/${appt.patient_id}`)} className="h-8 w-8 p-0 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
