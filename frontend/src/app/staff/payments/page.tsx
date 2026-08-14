"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, History, IndianRupee, PieChart, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaffPaymentsPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-indigo-500" /> Payments & Billing
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage patient invoices and transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-10 rounded-full font-medium shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
            <IndianRupee className="w-4 h-4 mr-2" /> Collect Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-950 flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 max-w-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Transactions Yet</h3>
            <p className="text-slate-500 text-sm mb-6">Payment history will appear here once you process your first transaction.</p>
            <Button variant="outline" className="rounded-full shadow-sm">
              View Old Records
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl bg-white dark:bg-slate-950">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-indigo-500" /> Today's Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">Collected Cash</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹0.00</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">Online Payments</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Collected</span>
                  <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">₹0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200 dark:border-amber-900/50 shadow-sm rounded-2xl bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-amber-900 dark:text-amber-500 flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5" /> Pending Approvals
              </h3>
              <p className="text-sm text-amber-700/80 dark:text-amber-500/80">
                You have 0 pending refunds or void requests requiring admin approval.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
