"use client";

import { useQuery } from "@tanstack/react-query";
import { getAppointments, getPatients, getDoctors } from "@/lib/api";
import { CreditCard, Search, Download, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { EmptyState } from "@/components/admin-dashboard/EmptyState";
import { MetricCard } from "@/components/admin-dashboard/MetricCard";

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: appointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients
  });

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors
  });

  const isLoading = loadingAppts || loadingPatients || loadingDoctors;

  // Simulate billing based on completed appointments
  // Assume a fixed consultation fee of ₹500 for demonstration
  const CONSULTATION_FEE = 500;

  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  
  const totalRevenue = completedAppointments.length * CONSULTATION_FEE;
  
  const today = new Date().toISOString().split('T')[0];
  const todaysRevenue = completedAppointments.filter(apt => apt.appointment_date === today).length * CONSULTATION_FEE;

  const filteredTransactions = completedAppointments.filter(apt => {
    const patient = patients.find(p => p.id === apt.patient_id);
    const doctor = doctors.find(d => d.id === apt.doctor_id);
    const searchString = `${patient?.name} ${doctor?.name} ${apt.id}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Billing & Payments</h1>
          <p className="text-sm text-[#6B7280] mt-1">Overview of hospital revenue and recent transactions.</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
          subtitle="All time earnings" 
          trend="up"
          loading={isLoading}
        />
        <MetricCard 
          title="Today's Revenue" 
          value={`₹${todaysRevenue.toLocaleString('en-IN')}`} 
          subtitle="Earnings for today" 
          trend="neutral"
          loading={isLoading}
        />
        <MetricCard 
          title="Completed Consultations" 
          value={completedAppointments.length} 
          subtitle="Total paid sessions" 
          trend="neutral"
          loading={isLoading}
        />
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#9CA3AF]" />
            </div>
            <input
              type="text"
              placeholder="Search by patient, doctor, or transaction ID..."
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
          ) : filteredTransactions.length === 0 ? (
            <div className="h-full min-h-[400px]">
              <EmptyState 
                icon={CreditCard} 
                title="No transactions found" 
                description={searchTerm ? "Try adjusting your search terms." : "No completed appointments found to generate billing records."}
              />
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#FAFAFA] text-xs uppercase text-[#6B7280] border-b border-[#E5E7EB] sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4 font-medium">Transaction ID</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Patient</th>
                  <th className="px-5 py-4 font-medium">Consultation (Doctor)</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredTransactions.map((apt) => {
                  const patient = patients.find(p => p.id === apt.patient_id);
                  const doctor = doctors.find(d => d.id === apt.doctor_id);
                  
                  let formattedDate = apt.appointment_date;
                  try {
                     formattedDate = format(new Date(apt.appointment_date), 'MMM d, yyyy');
                  } catch(e) {}

                  return (
                    <tr key={apt.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-[#111827] font-mono text-xs uppercase">TXN-{apt.id.substring(0, 8)}</div>
                      </td>
                      <td className="px-5 py-4 text-[#6B7280]">
                        {formattedDate}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827] font-medium">{patient?.name || 'Unknown'}</div>
                        <div className="text-xs text-[#6B7280]">{patient?.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#111827]">Dr. {doctor?.name || 'Unknown'}</div>
                        <div className="text-xs text-[#6B7280]">{doctor?.specialization || 'General'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Paid
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="text-[#111827] font-semibold">₹{CONSULTATION_FEE}</div>
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
