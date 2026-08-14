"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Loader2, Users, Search, Plus, Play, CheckSquare, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointments, getPatients } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function StaffQueuePage() {
  const queryClient = useQueryClient();
  const { data: appointments, isLoading: loadingAppts } = useQuery({ queryKey: ["appointments"], queryFn: getAppointments });
  const { data: patients, isLoading: loadingPatients } = useQuery({ queryKey: ["patients"], queryFn: getPatients });

  const [searchQuery, setSearchQuery] = useState("");

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
      toast.success("Queue status updated");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    }
  });

  const isLoading = loadingAppts || loadingPatients;

  // Walk-in queue focuses only on TODAY's patients who are active in the clinic
  const todaysQueue = useMemo(() => {
    if (!appointments) return [];
    
    let filtered = appointments.filter(a => {
      const isToday = new Date(a.appointment_date).toDateString() === new Date().toDateString();
      const isActiveStatus = ['scheduled', 'waiting', 'checked-in', 'in_consultation'].includes(a.status?.toLowerCase() || '');
      return isToday && isActiveStatus;
    });

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(appt => {
        const patient = patients?.find(p => p.id === appt.patient_id);
        return patient?.name?.toLowerCase().includes(lowerQuery) || 
               patient?.phone?.includes(lowerQuery) ||
               appt.patient_id.toLowerCase().includes(lowerQuery);
      });
    }

    return filtered.sort((a, b) => {
      // Prioritize by status: In Consultation -> Waiting -> Scheduled
      const statusWeight: any = { 'in_consultation': 3, 'waiting': 2, 'checked-in': 2, 'scheduled': 1 };
      const weightA = statusWeight[a.status?.toLowerCase() || ''] || 0;
      const weightB = statusWeight[b.status?.toLowerCase() || ''] || 0;
      if (weightA !== weightB) return weightB - weightA;
      return a.appointment_time.localeCompare(b.appointment_time);
    });
  }, [appointments, patients, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-emerald-500" /> Walk-in Queue
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage live patient flow for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search queue..." 
              className="pl-9 h-10 rounded-full bg-white dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-10 rounded-full font-medium shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Walk-in
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
              <p className="text-slate-500 font-medium">Loading queue...</p>
            </div>
          ) : todaysQueue.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-emerald-300 dark:text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Queue is empty</h3>
              <p className="text-slate-500 mt-1 max-w-sm">No active patients are currently waiting. Add a walk-in to start.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[80px] text-center font-semibold text-slate-600">Pos</TableHead>
                  <TableHead className="w-[300px] font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="font-semibold text-slate-600">Slot</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Live Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysQueue.map((appt, index) => {
                  const patient = patients?.find(p => p.id === appt.patient_id);
                  const isCurrent = appt.status?.toLowerCase() === 'in_consultation';
                  const isNext = !isCurrent && index === (todaysQueue.findIndex(a => a.status?.toLowerCase() !== 'in_consultation'));
                  
                  return (
                    <TableRow key={appt.id} className={`border-b border-slate-100 dark:border-slate-800/50 transition-colors ${isCurrent ? 'bg-blue-50/50 dark:bg-blue-900/10' : isNext ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}>
                      <TableCell className="text-center font-mono font-medium text-slate-500">
                        #{index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-10 w-10 border ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : isNext ? 'ring-2 ring-emerald-500 ring-offset-1' : 'border-slate-200 dark:border-slate-700'}`}>
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {patient?.name?.substring(0, 2).toUpperCase() || 'PT'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {patient ? patient.name : "Unnamed Patient"}
                              {isCurrent && <Badge className="h-4 px-1 text-[10px] bg-blue-500">Active</Badge>}
                              {isNext && <Badge variant="outline" className="h-4 px-1 text-[10px] text-emerald-600 border-emerald-200">Next</Badge>}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              ID: {patient?.id?.substring(0,8) || appt.patient_id.substring(0,8)} • {(appt as any).reason_for_visit || 'Consultation'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                           <Clock className="w-3.5 h-3.5 text-slate-400" /> {appt.appointment_time}
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          (appt.status as string) === 'in_consultation' ? 'default' : 
                          (appt.status as string) === 'waiting' || (appt.status as string) === 'checked-in' ? 'secondary' : 'secondary'
                        } className={`capitalize px-2.5 py-0.5 text-xs font-semibold rounded-full ${(appt.status as string) === 'in_consultation' ? 'bg-blue-500' : ''}`}>
                          {appt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           {((appt.status as string) === 'scheduled' || (appt.status as string) === 'pending') && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: appt.id, status: 'waiting' })} className="h-8 rounded-full text-xs font-medium px-4 bg-emerald-500 hover:bg-emerald-600 text-white">
                              Mark Waiting
                            </Button>
                          )}
                          {((appt.status as string) === 'waiting' || (appt.status as string) === 'checked-in') && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: appt.id, status: 'in_consultation' })} className="h-8 rounded-full text-xs font-medium px-4 bg-blue-500 hover:bg-blue-600 text-white">
                              <Play className="w-3.5 h-3.5 mr-1" /> Start Visit
                            </Button>
                          )}
                          {(appt.status as string) === 'in_consultation' && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: appt.id, status: 'completed' })} className="h-8 rounded-full text-xs font-medium px-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 text-white shadow-sm">
                              <CheckSquare className="w-3.5 h-3.5 mr-1" /> Complete
                            </Button>
                          )}
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
