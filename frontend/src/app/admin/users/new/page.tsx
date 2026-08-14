"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role, UserProfile } from "@/lib/rbac";
import { Loader2, ArrowLeft, UserPlus, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export default function NewUserRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  
  const initialRole = searchParams?.get("role")?.toUpperCase() as Role || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(initialRole);
  
  // Doctor specific fields
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState<number>(0);
  const [fee, setFee] = useState<number>(500);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const isDoctor = role === Role.DOCTOR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.tenantId) {
      toast.error("Error: Could not identify your hospital ID.");
      return;
    }

    setLoading(true);
    try {
      const metadata: any = { name };
      if (whatsappNumber) {
        metadata.whatsapp_number = whatsappNumber;
      }
      
      if (isDoctor) {
        metadata.specialization = specialization;
        metadata.experience = experience;
        metadata.fee = fee;
      }

      // Import dynamically as before
      const { createInvitation } = await import("@/app/invite/actions");
      
      const res = await createInvitation({
        tenantId: userProfile.tenantId,
        email,
        role: role as Role,
        metadata
      });

      if (res.error) {
        throw new Error(res.error);
      }

      const generatedLink = `${window.location.origin}/invite/${res.token}`;
      setInviteLink(generatedLink);
      toast.success("Invitation generated successfully!");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invitation");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInviteLink(null);
    setName("");
    setEmail("");
    setSpecialization("");
    setExperience(0);
    setFee(500);
    setWhatsappNumber("");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
          Register New User
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Add a new doctor, staff member, or admin to your hospital. They will receive a unique invitation link to join.
        </p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        
        {inviteLink ? (
          <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">Registration Successful!</h2>
            <p className="text-[#6B7280] mb-8 max-w-md">
              The invitation link for {name} has been securely generated. Share this link with them to complete their account setup.
            </p>
            
            <div className="w-full max-w-lg bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 flex flex-col gap-4">
              <div className="text-left">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2 block">
                  Secure Invite Link
                </label>
                <div className="p-3 bg-white border border-[#E5E7EB] rounded-md break-all text-sm font-mono text-[#111827] shadow-inner">
                  {inviteLink}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button 
                  className="flex-1 h-11"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" className="flex-1 h-11" onClick={resetForm}>
                  Register Another User
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Basic Info Section */}
            <div>
              <h3 className="text-base font-semibold text-[#111827] flex items-center border-b border-[#E5E7EB] pb-3 mb-5">
                <UserPlus className="h-4 w-4 mr-2 text-primary" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name <span className="text-rose-500">*</span></Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Jane Doe"
                    required 
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address <span className="text-rose-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="jane@example.com"
                    required 
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role" className="text-sm font-medium">Account Role <span className="text-rose-500">*</span></Label>
                  <Select value={role} onValueChange={(v) => setRole(v || "")} required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a role for this user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.HOSPITAL_ADMIN}>Hospital Administrator</SelectItem>
                      <SelectItem value={Role.DOCTOR}>Medical Doctor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Conditional Doctor Fields */}
            {isDoctor && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-base font-semibold text-[#111827] flex items-center border-b border-[#E5E7EB] pb-3 mb-5">
                  Doctor Profile Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specialty" className="text-sm font-medium">Specialization <span className="text-rose-500">*</span></Label>
                    <Input 
                      id="specialty" 
                      value={specialization} 
                      onChange={(e) => setSpecialization(e.target.value)} 
                      placeholder="e.g. Cardiologist, Neurologist" 
                      required={isDoctor} 
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm font-medium">Experience (Years)</Label>
                    <Input 
                      id="experience" 
                      type="number"
                      min="0"
                      value={experience} 
                      onChange={(e) => setExperience(parseInt(e.target.value) || 0)} 
                      required={isDoctor} 
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fee" className="text-sm font-medium">Consultation Fee (₹)</Label>
                    <Input 
                      id="fee" 
                      type="number"
                      min="0"
                      value={fee} 
                      onChange={(e) => setFee(parseInt(e.target.value) || 0)} 
                      required={isDoctor} 
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="text-sm font-medium">
                WhatsApp Number <span className="text-[#6B7280] font-normal">(Required for Bot Integration)</span>
              </Label>
              <Input 
                id="whatsapp_number" 
                value={whatsappNumber} 
                onChange={(e) => setWhatsappNumber(e.target.value)} 
                placeholder="+91 9876543210" 
                className="h-11"
              />
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="h-11 px-6">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !name || !email || !role || (isDoctor && !specialization)}
                className="h-11 px-6 bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate Invite Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
