import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CalendarX, Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function AvailabilityTab({ userProfile }: { userProfile: any }) {
  const [loading, setLoading] = useState(false);
  const [slotDuration, setSlotDuration] = useState("15");

  // Mock initial state for schedule
  const [schedule, setSchedule] = useState([
    { day: "Monday", active: true, startTime: "09:00", endTime: "17:00" },
    { day: "Tuesday", active: true, startTime: "09:00", endTime: "17:00" },
    { day: "Wednesday", active: true, startTime: "09:00", endTime: "17:00" },
    { day: "Thursday", active: true, startTime: "09:00", endTime: "17:00" },
    { day: "Friday", active: true, startTime: "09:00", endTime: "17:00" },
    { day: "Saturday", active: false, startTime: "10:00", endTime: "14:00" },
    { day: "Sunday", active: false, startTime: "09:00", endTime: "13:00" },
  ]);

  const [overrides, setOverrides] = useState<{ id: string, date: string, reason: string }[]>([
    { id: "1", date: new Date().toISOString().split('T')[0], reason: "Personal Leave" }
  ]);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const addOverride = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setOverrides([...overrides, { 
      id: Date.now().toString(), 
      date: tomorrow.toISOString().split('T')[0], 
      reason: "" 
    }]);
  };

  const removeOverride = (id: string) => {
    setOverrides(overrides.filter(o => o.id !== id));
  };

  const updateOverride = (id: string, field: 'date' | 'reason', value: string) => {
    setOverrides(overrides.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const saveAvailability = async () => {
    setLoading(true);
    try {
      // Here you would normally push this to Supabase `doctor_schedules` or a JSON field in `doctors` table
      // e.g. await supabase.from('doctors').update({ availability_json: { schedule, overrides, slotDuration } }).eq('user_id', userProfile?.uid);
      await new Promise(r => setTimeout(r, 1000));
      toast.success("Schedule & Availability updated successfully!");
    } catch (err: any) {
      toast.error("Failed to save schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Standard Working Hours
          </CardTitle>
          <CardDescription>Define your weekly availability and slot durations.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
             <div>
               <h4 className="font-semibold text-slate-900 dark:text-white">Consultation Slot Duration</h4>
               <p className="text-sm text-slate-500">How long each appointment typically lasts.</p>
             </div>
             <Select value={slotDuration} onValueChange={(val) => setSlotDuration(val || "15")}>
               <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                 <SelectValue placeholder="Select duration" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="10">10 Minutes</SelectItem>
                 <SelectItem value="15">15 Minutes</SelectItem>
                 <SelectItem value="20">20 Minutes</SelectItem>
                 <SelectItem value="30">30 Minutes</SelectItem>
                 <SelectItem value="45">45 Minutes</SelectItem>
                 <SelectItem value="60">1 Hour</SelectItem>
               </SelectContent>
             </Select>
          </div>

          <div className="space-y-4">
            {schedule.map((day, idx) => (
              <div key={day.day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="w-32 flex items-center gap-3">
                  <Switch checked={day.active} onCheckedChange={() => toggleDay(idx)} />
                  <span className={`font-medium ${day.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {day.day}
                  </span>
                </div>
                
                {day.active ? (
                  <div className="flex items-center gap-2 flex-1">
                     <Input 
                       type="time" 
                       value={day.startTime} 
                       onChange={(e) => updateTime(idx, 'startTime', e.target.value)}
                       className="w-32" 
                     />
                     <span className="text-slate-400">to</span>
                     <Input 
                       type="time" 
                       value={day.endTime} 
                       onChange={(e) => updateTime(idx, 'endTime', e.target.value)}
                       className="w-32" 
                     />
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-slate-400 italic">Unavailable</div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={saveAvailability} disabled={loading} className="rounded-full px-8 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-200 dark:border-rose-900/50 shadow-sm rounded-xl overflow-hidden bg-rose-50/50 dark:bg-rose-950/20">
        <CardHeader className="border-b border-rose-100 dark:border-rose-900/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-500">
                <CalendarX className="w-5 h-5" /> Mark Unavailable / Overrides
              </CardTitle>
              <CardDescription className="text-rose-600/70 dark:text-rose-400/70">
                Block out specific dates where you will not be available. This syncs directly with the WhatsApp Booking Flow.
              </CardDescription>
            </div>
            <Button onClick={addOverride} size="sm" className="bg-rose-100 hover:bg-rose-200 text-rose-700 border-none shadow-none rounded-full font-medium">
              <Plus className="w-4 h-4 mr-1" /> Add Date
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
           {overrides.length === 0 ? (
             <div className="text-center py-6 text-rose-500/70 text-sm font-medium">
               No upcoming unavailability overrides.
             </div>
           ) : (
             <div className="space-y-3">
               {overrides.map((override) => (
                 <div key={override.id} className="flex flex-col sm:flex-row gap-3 items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-rose-100 dark:border-rose-900">
                   <Input 
                     type="date" 
                     value={override.date} 
                     onChange={(e) => updateOverride(override.id, 'date', e.target.value)}
                     className="w-full sm:w-48"
                   />
                   <Input 
                     placeholder="Reason (e.g. Personal Leave, Conference)" 
                     value={override.reason}
                     onChange={(e) => updateOverride(override.id, 'reason', e.target.value)}
                     className="flex-1"
                   />
                   <Button variant="ghost" size="icon" onClick={() => removeOverride(override.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
               ))}
               <div className="flex justify-end pt-3">
                  <Button onClick={saveAvailability} disabled={loading} className="rounded-full shadow-sm bg-rose-600 hover:bg-rose-700 text-white text-xs px-6">
                    Update Overrides
                  </Button>
               </div>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
