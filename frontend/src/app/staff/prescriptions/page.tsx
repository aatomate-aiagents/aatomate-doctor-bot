"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Plus, Pill, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPatients } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CreatePrescriptionDraftModal } from "@/components/modals/CreatePrescriptionDraftModal";

// Assuming we have a getPrescriptions fetcher
const fetchPrescriptions = async () => {
  const res = await fetch('/api/v1/prescriptions');
  if (res.status === 404) return []; // some apis return 404 if not found
  if (!res.ok) throw new Error("Failed to fetch prescriptions");
  return res.json();
};

export default function StaffPrescriptionsPage() {
  const queryClient = useQueryClient();
  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery({ queryKey: ["prescriptions"], queryFn: fetchPrescriptions, retry: false });
  const { data: patients, isLoading: loadingPatients } = useQuery({ queryKey: ["patients"], queryFn: getPatients });

  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = loadingPrescriptions || loadingPatients;
  const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];

  const sortedPrescriptions = useMemo(() => {
    let filtered = safePrescriptions;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((presc: any) => {
        const patient = patients?.find(p => p.id === presc.patient_id);
        return patient?.name?.toLowerCase().includes(lowerQuery) || 
               presc.patient_id.toLowerCase().includes(lowerQuery);
      });
    }

    return filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [safePrescriptions, patients, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-8 h-8 text-purple-500" /> Prescriptions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage drafts and doctor approvals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by patient..." 
              className="pl-9 h-10 rounded-full bg-white dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CreatePrescriptionDraftModal />
        </div>
      </div>

      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
              <p className="text-slate-500 font-medium">Loading prescriptions...</p>
            </div>
          ) : sortedPrescriptions.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-300 dark:text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Prescriptions Found</h3>
              <p className="text-slate-500 mt-1 max-w-sm">No prescription drafts or records exist. Create a draft to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="font-semibold text-slate-600">Doctor</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPrescriptions.map((presc: any) => {
                  const patient = patients?.find(p => p.id === presc.patient_id);
                  const isPending = presc.status === 'needs_verification' || presc.status === 'pending_review';
                  
                  return (
                    <TableRow key={presc.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell className="font-medium">
                         {new Date(presc.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {patient?.name?.substring(0, 2).toUpperCase() || 'PT'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-semibold text-slate-900 dark:text-white flex flex-col">
                            {patient ? patient.name : "Unnamed Patient"}
                            <span className="text-xs text-slate-500 font-normal">ID: {presc.patient_id.substring(0,8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Dr. ID: {presc.doctor_id.substring(0,6)}...
                         </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          presc.status === 'approved' ? 'success' : 
                          isPending ? 'secondary' : 'secondary'
                        } className="capitalize px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center w-fit gap-1">
                          {presc.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <AlertCircle className="w-3 h-3" /> : null}
                          {isPending ? 'Pending Review' : presc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs font-medium px-4">
                          View
                        </Button>
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
