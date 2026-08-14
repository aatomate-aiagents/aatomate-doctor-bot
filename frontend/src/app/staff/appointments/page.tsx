"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Loader2, Search, Filter, Clock, CheckCircle2, UserCircle, Phone, Stethoscope, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointments, getPatients } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function StaffAppointmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: appointments, isLoading: loadingAppts } = useQuery({ queryKey: ["appointments"], queryFn: getAppointments });
  const { data: patients, isLoading: loadingPatients } = useQuery({ queryKey: ["patients"], queryFn: getPatients });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    }
  });

  const isLoading = loadingAppts || loadingPatients;

  const sortedAppointments = useMemo(() => {
    let filtered = appointments || [];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(appt => {
        const patient = patients?.find(p => p.id === appt.patient_id);
        return (patient?.name?.toLowerCase().includes(lowerQuery)) || 
               (patient?.phone?.includes(lowerQuery)) ||
               ((appt as any).reason_for_visit?.toLowerCase().includes(lowerQuery)) ||
               (appt.patient_id.toLowerCase().includes(lowerQuery));
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(appt => appt.status === statusFilter);
    }

    return filtered.slice().sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [appointments, patients, searchQuery, statusFilter]);

  const totalAppts = appointments || [];
  const completedTotal = totalAppts.filter(a => a.status === 'completed').length;
  const pendingTotal = totalAppts.filter(a => a.status === 'scheduled' || a.status === 'waiting').length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage scheduled consultations and patient flow.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push("/staff/queue")} variant="outline" className="h-10 rounded-full font-medium shadow-sm">
            Walk-in Queue
          </Button>
          <Button className="h-10 rounded-full font-medium shadow-sm px-5">
            Book Appointment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[20px] shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Scheduled</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalAppts.length}
            </h3>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Pending/Waiting</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : pendingTotal}
            </h3>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : completedTotal}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by patient name, phone, or ID..." 
              className="pl-9 h-10 rounded-full bg-white dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Filter className="w-4 h-4" /> Filter:
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10 rounded-full bg-white dark:bg-slate-900">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-slate-500 font-medium">Loading appointments...</p>
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No appointments found</h3>
              <p className="text-slate-500 mt-1 max-w-sm">There are no appointments matching your current search or filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[280px] font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="font-semibold text-slate-600">Date & Time</TableHead>
                  <TableHead className="font-semibold text-slate-600">Doctor</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAppointments.map((appt) => {
                  const patient = patients?.find(p => p.id === appt.patient_id);
                  return (
                    <TableRow key={appt.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {patient?.name?.substring(0, 2).toUpperCase() || 'PT'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {patient ? patient.name : "Unnamed Patient"}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                              {patient?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>}
                              <span className="truncate max-w-[150px]">{(appt as any).reason_for_visit || appt.reason || 'Consultation'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{new Date(appt.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.appointment_time}</div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                           <Stethoscope className="w-4 h-4 text-slate-400" /> Dr. Assignment
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          appt.status === 'completed' ? 'success' : 
                          appt.status === 'cancelled' ? 'destructive' : 
                          appt.status === 'waiting' || appt.status === 'checked-in' ? 'warning' : 'default'
                        } className="capitalize px-2.5 py-0.5 text-xs font-semibold rounded-full">
                          {appt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(appt.status === 'scheduled' || appt.status === 'pending') && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: appt.id, status: 'waiting' })} className="h-8 rounded-full text-xs font-medium px-4 shadow-sm bg-primary hover:bg-primary/90 text-white">
                              Check In
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/staff/patients/${appt.patient_id}`)} className="h-8 w-8 p-0 rounded-full text-slate-500 hover:text-primary hover:bg-primary/10">
                            <ChevronRight className="w-4 h-4" />
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
