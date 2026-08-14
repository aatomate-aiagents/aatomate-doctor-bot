"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, User, Phone, Mail, Stethoscope, Clock, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { AvailabilityTab } from "./AvailabilityTab";

export default function DoctorSettingsPage() {
  const { userProfile, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("tab") || "profile";
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [fee, setFee] = useState("");

  useEffect(() => {
    if (userProfile?.uid) {
      loadDoctorData();
    }
  }, [userProfile]);

  const loadDoctorData = async () => {
    try {
      setFetching(true);
      // Fetch from users table
      setName(userProfile?.name || "");
      setPhone("");
      
      // Fetch doctor specific data
      const { data: docData, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userProfile?.uid)
        .single();
        
      if (docData && !error) {
        setSpecialty(docData.specialty || "");
        setFee(docData.consultation_fee?.toString() || "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({ name, phone })
        .eq('id', userProfile?.uid);
        
      if (userError) throw userError;

      // Update doctors table
      const { error: docError } = await supabase
        .from('doctors')
        .update({ 
          specialty, 
          consultation_fee: fee ? parseInt(fee) : 0 
        })
        .eq('user_id', userProfile?.uid);
        
      if (docError) throw docError;

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your personal and professional profile.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md">
            <User className="w-4 h-4 mr-2" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md">
            <Shield className="w-4 h-4 mr-2" />
            Account & Security
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md">
            <Clock className="w-4 h-4 mr-2" />
            Schedule & Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle>Professional Profile</CardTitle>
              <CardDescription>Update your contact and medical practice information.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      className="pl-9 rounded-lg"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      className="pl-9 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                      value={user?.email || ""} 
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      className="pl-9 rounded-lg"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Specialty / Designation</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      className="pl-9 rounded-lg"
                      placeholder="e.g. Senior Cardiologist"
                      value={specialty} 
                      onChange={(e) => setSpecialty(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Consultation Fee (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                    <Input 
                      type="number"
                      className="pl-7 rounded-lg"
                      placeholder="500"
                      value={fee} 
                      onChange={(e) => setFee(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                  className="rounded-full px-8 shadow-sm font-semibold tracking-wide"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="availability">
          <AvailabilityTab userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="preferences">
           <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>Manage your security settings and session.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Sign Out All Sessions</h3>
                    <p className="text-sm text-slate-500 mt-1">If you lost a device, you can sign out everywhere.</p>
                  </div>
                  <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-white rounded-lg">
                    Sign Out All
                  </Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
