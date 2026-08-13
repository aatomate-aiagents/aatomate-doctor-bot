"use client";

import { useQuery } from "@tanstack/react-query";
import { getLaboratoryTests, getPatients, getDoctors } from "@/lib/api";
import { FileText, Search, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { EmptyState } from "@/components/admin-dashboard/EmptyState";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tests = [], isLoading: loadingTests } = useQuery({
    queryKey: ["tests"],
    queryFn: getLaboratoryTests
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors
  });

  const isLoading = loadingTests || loadingPatients || loadingDoctors;

  const filteredTests = tests.filter(test => {
    const patient = patients.find(p => p.id === test.patient_id);
    const doctor = doctors.find(d => d.id === test.doctor_id);
    const searchString = `${test.test_name} ${patient?.name} ${doctor?.name} ${test.status}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Medical Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">View and manage laboratory tests and patient medical reports.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#9CA3AF]" />
            </div>
            <input
              type="text"
              placeholder="Search by test name, patient, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-5 flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded w-full animate-pulse"></div>
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="h-full min-h-[400px]">
              <EmptyState 
                icon={FileText} 
                title="No reports found" 
                description={searchTerm ? "Try adjusting your search terms." : "No laboratory tests or reports have been recorded yet."}
              />
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#FAFAFA] text-xs uppercase text-[#6B7280] border-b border-[#E5E7EB] sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4 font-medium">Test Information</th>
                  <th className="px-5 py-4 font-medium">Patient</th>
                  <th className="px-5 py-4 font-medium">Prescribed By</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredTests.map((test) => {
                  const patient = patients.find(p => p.id === test.patient_id);
                  const doctor = doctors.find(d => d.id === test.doctor_id);
                  
                  let formattedDate = test.created_at;
                  try {
                     formattedDate = format(new Date(test.created_at), 'MMM d, yyyy');
                  } catch(e) {}

                  return (
                    <tr key={test.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-[#111827] font-medium max-w-[200px] truncate">{test.test_name}</div>
                        <div className="text-xs text-[#6B7280]">Added: {formattedDate}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827] font-medium">{patient?.name || 'Unknown'}</div>
                        <div className="text-xs text-[#6B7280]">ID: {test.patient_id.substring(0, 8)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827]">Dr. {doctor?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          test.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          test.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {test.report_url ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-white"
                            onClick={() => window.open(test.report_url || '', '_blank')}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            View Report
                          </Button>
                        ) : (
                          <span className="text-xs text-[#9CA3AF] italic">Not available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
