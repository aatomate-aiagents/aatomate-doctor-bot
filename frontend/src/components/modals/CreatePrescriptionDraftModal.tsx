"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export function CreatePrescriptionDraftModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [notes, setNotes] = useState("");

  const createDraft = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/v1/prescriptions/draft', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create draft");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Draft submitted to Doctor for review!");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setOpen(false);
      setPatientId("");
      setDoctorId("");
      setNotes("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit draft");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId) {
      toast.error("Patient ID and Doctor ID are required");
      return;
    }
    
    // Create a structured base matching PrescriptionBase
    createDraft.mutate({
      patient_id: patientId,
      doctor_id: doctorId,
      clinical_notes: notes,
      medicines: [],
      diagnoses: []
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full font-medium shadow-sm bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Draft Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Prescription Draft</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Patient ID</Label>
            <Input 
              required 
              placeholder="e.g. 123e4567-e89b..." 
              value={patientId} 
              onChange={e => setPatientId(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Assign to Doctor (Doctor ID)</Label>
            <Input 
              required 
              placeholder="e.g. 123e4567-e89b..." 
              value={doctorId} 
              onChange={e => setDoctorId(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Initial Notes / Complaint</Label>
            <Textarea 
              placeholder="Enter patient complaint or preliminary notes..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              rows={4}
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-3 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/50">
            This will be saved as a Draft ("Pending Review") and must be approved by the assigned Doctor before becoming active.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createDraft.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
              {createDraft.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send to Doctor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
