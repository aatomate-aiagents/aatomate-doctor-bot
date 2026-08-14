"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPatients, getAppointments } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AddPatientModal } from "@/components/modals/AddPatientModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Plus, Phone, Mail, 
  Calendar, FileText, ChevronRight, Loader2, Stethoscope, Droplet
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function StaffPatientsPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const { data: appointments, isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments
  });

  const isLoading = loadingPatients || loadingAppts;

  const getPatientLastVisit = (patientId: string) => {
    if (!appointments) return null;
    const pastAppts = appointments
      .filter(a => a.patient_id === patientId && new Date(a.appointment_date) <= new Date() && a.status === 'completed')
      .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
    return pastAppts.length > 0 ? new Date(pastAppts[0].appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Never';
  };

  const getPatientNextVisit = (patientId: string) => {
    if (!appointments) return null;
    const futureAppts = appointments
      .filter(a => a.patient_id === patientId && new Date(a.appointment_date) >= new Date() && a.status !== 'completed' && a.status !== 'cancelled')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    return futureAppts.length > 0 ? new Date(futureAppts[0].appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'None';
  };

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    let filtered = patients;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.phone && p.phone.includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }

    if (filter === "today") {
      const today = new Date().toDateString();
      const todayApptPatientIds = (appointments || [])
        .filter(a => new Date(a.appointment_date).toDateString() === today)
        .map(a => a.patient_id);
      filtered = filtered.filter(p => todayApptPatientIds.includes(p.id));
    }

    return filtered;
  }, [patients, searchQuery, filter, appointments]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Patients</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your patient directory and medical records.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search patients..." 
              className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddPatientModal triggerText="Add Patient" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[20px] shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Patients</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (patients?.length || 0)}
            </h3>
          </CardContent>
        </Card>
        <Card className="rounded-[20px] shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Today's Visits</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                ((appointments || []).filter(a => new Date(a.appointment_date).toDateString() === new Date().toDateString()).length)
              }
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'today', 'new', 'follow_up'].map(f => (
          <Button 
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 text-xs font-medium capitalize ${filter === f ? 'shadow-md' : 'bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800'}`}
          >
            {f === 'follow_up' ? 'Follow-ups' : f === 'all' ? 'All Patients' : f}
          </Button>
        ))}
      </div>

      {/* Patient Directory */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-slate-500 font-medium">Loading patient directory...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No patients found</h3>
              <p className="text-slate-500 mt-1 max-w-sm">No patients match your current filters. Adjust your search or add a new patient.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[300px] font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="font-semibold text-slate-600">Patient ID</TableHead>
                  <TableHead className="font-semibold text-slate-600">Age / Gender</TableHead>
                  <TableHead className="font-semibold text-slate-600">Last Visit</TableHead>
                  <TableHead className="font-semibold text-slate-600">Next Appointment</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer" onClick={() => router.push(`/staff/patients/${patient.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {patient.name?.substring(0, 2).toUpperCase() || 'PT'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {patient.name || "Unnamed Patient"}
                          </div>
                          {patient.phone && (
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {patient.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {patient.id.substring(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {(patient.age || patient.gender) ? (
                        <div className="flex items-center gap-2">
                          {patient.age && <span>{patient.age} yrs</span>}
                          {patient.age && patient.gender && <span className="w-1 h-1 bg-slate-300 rounded-full"></span>}
                          {patient.gender && <span className="capitalize">{patient.gender}</span>}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {getPatientLastVisit(patient.id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {getPatientNextVisit(patient.id)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full text-primary hover:bg-primary/10 font-semibold text-xs">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
