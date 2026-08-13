"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { updateTenant, getTenant } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Building2, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function EditHospitalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  // Basic info
  const [hospitalName, setHospitalName] = useState("");
  const [name, setName] = useState("");
  
  // Contact
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Location
  const [address, setAddress] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const { data: tenant, isLoading: isFetching } = useQuery({
    queryKey: ["tenant", params.id],
    queryFn: () => getTenant(params.id),
    enabled: !!params.id
  });

  useEffect(() => {
    if (tenant) {
      setHospitalName(tenant.hospital_name || "");
      setName(tenant.name || "");
      setEmail(tenant.email || "");
      setPhoneNumber(tenant.phone_number || "");
      setAddress(tenant.address || "");
      setClinicAddress(tenant.clinic_address || "");
      setRoomFloor(tenant.room_floor || "");
      setLatitude(tenant.latitude ? tenant.latitude.toString() : "");
      setLongitude(tenant.longitude ? tenant.longitude.toString() : "");
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!hospitalName || !name || !email || !phoneNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await updateTenant(params.id, {
        hospital_name: hospitalName,
        name,
        email,
        phone_number: phoneNumber,
        address: address || undefined,
        clinic_address: clinicAddress || undefined,
        room_floor: roomFloor || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });
      
      toast.success("Hospital updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", params.id] });
      
      // Redirect back to hospitals list
      router.push("/super-admin/hospitals");
    } catch (error: any) {
      console.error("Error updating hospital:", error);
      toast.error(error?.response?.data?.detail || "Failed to update hospital. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/super-admin/hospitals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Hospital Details</h1>
          <p className="text-muted-foreground">
            Update the information for this registered hospital tenant.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>Basic Information</CardTitle>
              </div>
              <CardDescription>The core details of the hospital facility.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital/Clinic Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="hospitalName" 
                  value={hospitalName} 
                  onChange={(e) => setHospitalName(e.target.value)} 
                  placeholder="e.g. City General Hospital" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Owner/Admin Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Dr. John Doe" 
                  required 
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Contact Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Contact Details</CardTitle>
              </div>
              <CardDescription>How to reach the hospital administration.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@hospital.com" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="+1234567890" 
                  required 
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Location Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <CardTitle>Location Details</CardTitle>
              </div>
              <CardDescription>Where this hospital is physically located.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Full Street Address</Label>
                <Input 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="123 Medical Center Blvd, Suite 400, New York, NY 10001" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Short/Locality Address</Label>
                <Input 
                  id="clinicAddress" 
                  value={clinicAddress} 
                  onChange={(e) => setClinicAddress(e.target.value)} 
                  placeholder="Downtown Medical District" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomFloor">Room / Floor</Label>
                <Input 
                  id="roomFloor" 
                  value={roomFloor} 
                  onChange={(e) => setRoomFloor(e.target.value)} 
                  placeholder="4th Floor, Room 402" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  type="number"
                  step="any"
                  value={latitude} 
                  onChange={(e) => setLatitude(e.target.value)} 
                  placeholder="40.7128" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  type="number"
                  step="any"
                  value={longitude} 
                  onChange={(e) => setLongitude(e.target.value)} 
                  placeholder="-74.0060" 
                />
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-end gap-4 py-6 bg-muted/20">
              <Link href="/super-admin/hospitals">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
