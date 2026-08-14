"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, FileUp, FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPatients, getLaboratoryTests } from "@/lib/api"; // Using lab tests as reports for now
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function StaffReportsPage() {
  const { data: reports, isLoading: loadingReports } = useQuery({ queryKey: ["laboratoryTests"], queryFn: getLaboratoryTests });
  const { data: patients, isLoading: loadingPatients } = useQuery({ queryKey: ["patients"], queryFn: getPatients });

  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = loadingReports || loadingPatients;
  const safeReports = Array.isArray(reports) ? reports : [];

  const sortedReports = useMemo(() => {
    let filtered = safeReports;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((report: any) => {
        const patient = patients?.find(p => p.id === report.patient_id);
        return patient?.name?.toLowerCase().includes(lowerQuery) || 
               report.patient_id.toLowerCase().includes(lowerQuery) ||
               (report.test_name && report.test_name.toLowerCase().includes(lowerQuery));
      });
    }

    return filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [safeReports, patients, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-amber-500" /> Patient Reports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage laboratory and diagnostic reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search reports..." 
              className="pl-9 h-10 rounded-full bg-white dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-10 rounded-full font-medium shadow-sm bg-amber-600 hover:bg-amber-700 text-white">
            <FileUp className="w-4 h-4 mr-2" /> Upload Report
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
              <p className="text-slate-500 font-medium">Loading reports...</p>
            </div>
          ) : sortedReports.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-amber-300 dark:text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Reports Found</h3>
              <p className="text-slate-500 mt-1 max-w-sm">No diagnostic reports exist matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="font-semibold text-slate-600">Patient</TableHead>
                  <TableHead className="font-semibold text-slate-600">Test / Report Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReports.map((report: any) => {
                  const patient = patients?.find(p => p.id === report.patient_id);
                  const isPending = report.status === 'pending' || report.status === 'in_progress';
                  
                  return (
                    <TableRow key={report.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell className="font-medium">
                         {new Date(report.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                            <span className="text-xs text-slate-500 font-normal">ID: {report.patient_id.substring(0,8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {report.test_name || 'Lab Report'}
                         </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          report.status === 'completed' ? 'success' : 
                          isPending ? 'warning' : 'secondary'
                        } className="capitalize px-2.5 py-0.5 text-xs font-semibold rounded-full">
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs font-medium px-4">
                          <Download className="w-3.5 h-3.5 mr-1" /> View/Download
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
