"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/lib/api";
import { Users, Search, Activity } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { EmptyState } from "@/components/admin-dashboard/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const filteredPatients = patients.filter(p => {
    const searchString = `${p.name} ${p.phone} ${p.email || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Patients</h1>
          <p className="text-sm text-[#6B7280] mt-1">Directory of all registered patients in the hospital.</p>
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
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="text-sm font-medium text-[#6B7280]">
            Total Patients: <span className="text-[#111827]">{filteredPatients.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-5 flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded w-full animate-pulse"></div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="h-full min-h-[400px]">
              <EmptyState 
                icon={Users} 
                title="No patients found" 
                description={searchTerm ? "Try adjusting your search terms." : "No patients have been registered yet."}
              />
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#FAFAFA] text-xs uppercase text-[#6B7280] border-b border-[#E5E7EB] sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4 font-medium">Patient Details</th>
                  <th className="px-5 py-4 font-medium">Contact Information</th>
                  <th className="px-5 py-4 font-medium">Age & Gender</th>
                  <th className="px-5 py-4 font-medium">Blood Group</th>
                  <th className="px-5 py-4 font-medium text-right">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredPatients.map((patient) => {
                  let formattedDate = patient.created_at;
                  try {
                     formattedDate = format(new Date(patient.created_at), 'MMM d, yyyy');
                  } catch(e) {}

                  return (
                    <tr key={patient.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 bg-[#F3F4F6] border border-[#E5E7EB]">
                            <AvatarFallback className="text-[#4B5563] text-xs font-medium">
                              {patient.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-[#111827] font-medium">{patient.name}</div>
                            <div className="text-xs text-[#6B7280]">ID: {patient.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827]">{patient.phone}</div>
                        <div className="text-xs text-[#6B7280]">{patient.email || '-'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827] capitalize">{patient.age ? `${patient.age} yrs` : '-'}</div>
                        <div className="text-xs text-[#6B7280] capitalize">{patient.gender || '-'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          patient.blood_group ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {patient.blood_group || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-[#6B7280]">
                        {formattedDate}
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
