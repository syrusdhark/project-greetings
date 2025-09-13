import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SchoolBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
}

interface SchoolSport {
  id: string; // school_sports id
  sport_id: string;
  sport_name: string;
  price_per_person: number;
  currency: string;
}

interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string;   // HH:MM:SS
  capacity: number;
  seats_left: number;
}

export default function SchoolBookingModal({ isOpen, onClose, schoolId, schoolName }: SchoolBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sports, setSports] = useState<SchoolSport[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [participants, setParticipants] = useState<number>(1);


  const selectedSport = useMemo(() => sports.find(s => s.sport_id === selectedSportId) || null, [sports, selectedSportId]);
  const selectedSlot = useMemo(() => timeSlots.find(ts => ts.id === selectedSlotId) || null, [timeSlots, selectedSlotId]);

  const slotDurationMinutes = useMemo(() => {
    if (!selectedSlot) return 0;
    const [sh, sm] = selectedSlot.start_time.split(":").map(Number);
    const [eh, em] = selectedSlot.end_time.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }, [selectedSlot]);

  const maxParticipants = selectedSlot ? Math.max(1, selectedSlot.seats_left) : 1;

  // Available dates derived from loaded time slots
  const availableDateStrings = useMemo(() => Array.from(new Set(timeSlots.map(ts => ts.date))), [timeSlots]);
  const availableDateSet = useMemo(() => new Set(availableDateStrings), [availableDateStrings]);
  const selectedDateSlots = useMemo(() => timeSlots.filter(ts => ts.date === selectedDate), [timeSlots, selectedDate]);
  const selectedDateObj = useMemo(() => (selectedDate ? new Date(selectedDate + "T00:00:00") : undefined), [selectedDate]);

  // Deposit rule: 20% if booking less than 60% of capacity, 15% if 60% or more
  const depositPercent = useMemo(() => {
    if (!selectedSlot) return 0.2; // default 20%
    const isSixtyOrMore = selectedSlot.capacity > 0 && (participants / selectedSlot.capacity) >= 0.6;
    return isSixtyOrMore ? 0.15 : 0.20;
  }, [participants, selectedSlot]);

  const depositAmount = useMemo(() => {
    if (!selectedSport) return 0;
    const base = selectedSport.price_per_person * participants;
    return Math.ceil(base * depositPercent);
  }, [selectedSport, participants, depositPercent]);

  useEffect(() => {
    if (!isOpen) return;
    // Load active sports for this school via RPC (bypasses RLS)
    (async () => {
      const { data, error } = await (supabase as any).rpc("rpc_get_school_sports", { p_school_id: schoolId });
      if (error) {
        console.error("SchoolBookingModal: failed to load sports", error);
        toast({ title: "Error", description: "Unable to load sports", variant: "destructive" });
        return;
      }
      const rows: any[] = Array.isArray(data) ? data : [];
      const mapped: SchoolSport[] = rows.map((row: any) => ({
        id: row.sport_id,
        sport_id: row.sport_id,
        sport_name: row.sport_name || "Sport",
        price_per_person: Number(row.price_per_person || 0),
        currency: row.currency || "INR",
      }));
      setSports(mapped);
      if (mapped.length > 0) setSelectedSportId(mapped[0].sport_id);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, schoolId]);

  useEffect(() => {
    if (!selectedSportId || !isOpen) return;
    // Load all future open time slots for selected sport
    (async () => {
      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("time_slots")
        .select("id, date, start_time, end_time, capacity, seats_left")
        .eq("school_id", schoolId)
        .eq("sport_id", selectedSportId)
        .eq("status", "open")
        .gte("date", todayStr)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) {
        console.error("SchoolBookingModal: load slots error", error);
        toast({ title: "Error", description: "Unable to load time slots", variant: "destructive" });
        return;
      }
      const slots: TimeSlot[] = (data || []) as any;
      setTimeSlots(slots);
      
      // If no slots exist, try to generate some for the next 30 days
      if (slots.length === 0) {
        console.log("No time slots found, attempting to generate some...");
        // This is a fallback - in a real app, you'd want to generate slots via admin interface
        toast({ 
          title: "No Slots Available", 
          description: "No time slots are currently available. Please contact the school directly to request availability.", 
          variant: "destructive" 
        });
      }
      
      if (slots.length > 0) {
        const firstDate = slots[0].date;
        setSelectedDate(firstDate);
        const firstOfDate = slots.find(s => s.date === firstDate)!;
        setSelectedSlotId(firstOfDate.id);
      } else {
        setSelectedDate("");
        setSelectedSlotId("");
      }
    })();
  }, [selectedSportId, isOpen, schoolId, toast]);

  useEffect(() => {
    if (selectedSlot) {
      setParticipants(1);
    }
  }, [selectedSlot]);

  const handleConfirm = async () => {
    try {
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to book", variant: "destructive" });
        const resume = `/bookings?schoolId=${schoolId}&open=1`;
        window.location.href = `/signin?returnTo=${encodeURIComponent(resume)}`;
        return;
      }
      if (!selectedSport || !selectedSlot) {
        toast({ title: "Select details", description: "Choose sport and slot" });
        return;
      }
      const { data, error } = await supabase.rpc("rpc_create_hold", {
        p_user_id: user.id,
        p_school_id: schoolId,
        p_sport_id: selectedSport.sport_id,
        p_time_slot_id: selectedSlot.id,
        p_amount: depositAmount,
      });
      if (error) throw error;
      const bookingId = (data as any)?.[0]?.booking_id || (data as any)?.booking_id;
      toast({ title: "Seat held", description: "Complete deposit to confirm" });
      onClose();
      // Redirect to deposit page
      window.location.href = `/deposit/${bookingId}`;
    } catch (e: any) {
      console.error("SchoolBookingModal: confirm error", e);
      toast({ title: "Could not hold seat", description: e.message || "Try again", variant: "destructive" });
    }
  };

  


  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Book with {schoolName}</DialogTitle>
          <DialogDescription id="booking-desc">Choose sport, date, slot and participants, then pay the deposit to confirm.</DialogDescription>
        </DialogHeader>

        {/* Sport selection */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Sport</Label>
            <Select value={selectedSportId} onValueChange={setSelectedSportId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((s) => (
                  <SelectItem key={s.sport_id} value={s.sport_id}>
                    {s.sport_name} — ₹{s.price_per_person}/person
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !selectedDateObj && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateObj ? format(selectedDateObj, "EEE, d MMM") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDateObj}
                  onSelect={(d) => {
                    if (!d) return;
                    const ds = format(d, "yyyy-MM-dd");
                    setSelectedDate(ds);
                    const firstForDay = timeSlots.find(ts => ts.date === ds);
                    setSelectedSlotId(firstForDay ? firstForDay.id : "");
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    const fiveMonthsFromNow = new Date();
                    fiveMonthsFromNow.setMonth(fiveMonthsFromNow.getMonth() + 5);
                    
                    // Only disable dates before today and after 5 months
                    const isBeforeToday = date < today;
                    const isAfterFiveMonths = date > fiveMonthsFromNow;
                    
                    return isBeforeToday || isAfterFiveMonths;
                  }}
                  fromMonth={new Date()} // Start from current month
                  toMonth={(() => {
                    const fiveMonthsFromNow = new Date();
                    fiveMonthsFromNow.setMonth(fiveMonthsFromNow.getMonth() + 5);
                    return fiveMonthsFromNow;
                  })()} // End at 5 months from now
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Slot selection */}
          <div className="space-y-2">
            <Label>Available Slots</Label>
            {selectedDateSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedDateSlots.map((ts) => (
                  <Button
                    key={ts.id}
                    variant={selectedSlotId === ts.id ? "default" : "outline"}
                    onClick={() => setSelectedSlotId(ts.id)}
                    className="justify-between"
                  >
                    <span>{ts.start_time.slice(0,5)}–{ts.end_time.slice(0,5)}</span>
                    <span className="text-xs text-muted-foreground">{ts.seats_left} left</span>
                  </Button>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-sm text-muted-foreground">
                No time slots available for this date. Please contact the school directly to request availability.
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Select a date to see available slots.</div>
            )}
          </div>


          {/* Participants */}
          <div className="space-y-2">
            <Label>Participants</Label>
            <Input
              type="number"
              min={1}
              max={maxParticipants}
              value={participants}
              onChange={(e) => setParticipants(Math.min(maxParticipants, Math.max(1, parseInt(e.target.value || "1", 10))))}
            />
            {selectedSlot && (
              <div className="text-xs text-muted-foreground">
                Capacity {selectedSlot.capacity}, seats left {selectedSlot.seats_left}. Deposit {Math.round(depositPercent * 100)}%.
              </div>
            )}
          </div>

          {/* Summary & Action */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Deposit to pay now</div>
              <div className="text-2xl font-bold text-primary">₹{depositAmount || 0}</div>
            </div>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedSport || !selectedSlot}
              className={!selectedSlot ? "opacity-50 cursor-not-allowed" : ""}
            >
              {!selectedSlot ? "Select a Time Slot" : "Confirm & Pay"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
