"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { ReservationType } from "../page";

/* ----------------------------- TIME HELPERS ----------------------------- */

const parseTimeTo24 = (input?: string): string => {
  if (!input) return "00:00";
  const raw = input.trim();

  const ampmMatch = raw.match(/^\s*(\d{1,2})([:.]?)(\d{0,2})\s*([AaPp][Mm])\s*$/);
  if (ampmMatch) {
    const hour = Number(ampmMatch[1]);
    const minutes = Number((ampmMatch[3] || "00").padStart(2, "0"));
    const ampm = ampmMatch[4].toUpperCase();

    let h24 = hour % 12;
    if (ampm === "PM") h24 += 12;
    if (ampm === "AM" && hour === 12) h24 = 0;

    return `${String(h24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  if (raw.includes(":")) {
    const [h, m] = raw.split(":");
    return `${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}`;
  }

  if (raw.includes(".")) {
    const [h, m] = raw.split(".");
    return `${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}`;
  }

  if (/^\d{1,2}$/.test(raw)) {
    return `${String(Number(raw)).padStart(2, "0")}:00`;
  }

  return "00:00";
};

const minsTo12h = (mins: number) => {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
};

const timeStrToMins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

type TableType = {
  id: string;
  name: string;
  capacity: number;
};

export default function NewReservationPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("1");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [table, setTable] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [specialRequests, setSpecialRequests] = useState("");

  const [settingsTables, setSettingsTables] = useState<TableType[]>([]);
  const [maxGuests, setMaxGuests] = useState(11);
  const [slotInterval, setSlotInterval] = useState(30);

  const [settingsStartTimeRaw, setSettingsStartTimeRaw] = useState("05:30 PM");
  const [settingsEndTimeRaw, setSettingsEndTimeRaw] = useState("12:30 AM");

  const capacityPattern = [4, 6, 8, 10];

  const [dynamicTimeSlots, setDynamicTimeSlots] = useState<string[]>([]);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const today = startOfDay(new Date());

  const generateSlotsFrom24 = (start24: string, end24: string, interval: number) => {
    let startMin = timeStrToMins(start24);
    let endMin = timeStrToMins(end24);

    if (endMin <= startMin) endMin += 1440; // cross midnight

    const slots: string[] = [];
    for (let t = startMin; t <= endMin; t += interval) {
      slots.push(minsTo12h(t));
    }
    return slots;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        const numberOfTables = data.tableSettings?.numberOfTables ?? 7;
        setSettingsTables(
          Array.from({ length: numberOfTables }, (_, i) => ({
            id: `table-${i + 1}`,
            name: `Table ${i + 1}`,
            capacity: capacityPattern[i % capacityPattern.length],
          }))
        );

        const r = data.reservationSettings || {};
        const rawStart = String(r.startTime ?? "05:30 PM");
        const rawEnd = String(r.endTime ?? "12:30 AM");

        setSettingsStartTimeRaw(rawStart);
        setSettingsEndTimeRaw(rawEnd);

        setMaxGuests(Number(r.maxGuests ?? 11));
        setSlotInterval(Number(r.slotInterval ?? 30));

        const start24 = parseTimeTo24(rawStart);
        const end24 = parseTimeTo24(rawEnd);

        setDynamicTimeSlots(generateSlotsFrom24(start24, end24, r.slotInterval ?? 30));
      } catch (err) {
        console.log("Failed to fetch settings", err);
      }
    };

    load();
  }, []);

  const generateReservationID = () =>
    `RES-${Math.floor(Math.random() * 900 + 100)}`;

  /* Prevent selecting past dates: this makes the calendar "single-date" and disables past picks */
  const handleDateSelect = (d: Date | undefined) => {
    if (!d) return;
    const selectedDay = startOfDay(d);
    if (isBefore(selectedDay, today)) {
      // small visual feedback: briefly add shake to popover
      if (popoverRef.current) {
        popoverRef.current.classList.remove("animate-shake");
        // force reflow to restart animation
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        popoverRef.current.offsetWidth;
        popoverRef.current.classList.add("animate-shake");
      }
      // gentle alert
      // prefer non-blocking UI; using window.alert as fallback
      window.alert("Past dates cannot be selected. Please choose today or a future date.");
      return;
    }
    setDate(d);
  };

  const handleCreate = async () => {
    if (!customerName || !phone || !date || !time || !table) {
      // small shake on missing input
      window.alert("Please fill all required fields.");
      return;
    }

    const newReservation: ReservationType = {
      id: generateReservationID(),
      customerName,
      email: email || undefined,
      phone,
      guests: Number(guests),
      date: date.toISOString().split("T")[0],
      time,
      table,
      status,
      specialRequests: specialRequests || undefined,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("/api/reservation/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReservation),
    });

    if (!res.ok) {
      window.alert("Error creating reservation");
      return;
    }

    // success micro-interaction
    // you could replace with a toast
    window.alert("Reservation created successfully");
    router.push("/dashboard/reservations");
  };

  /* ------------------------------ UI ------------------------------ */

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Card className="shadow-xl rounded-3xl overflow-hidden border border-orange-200">
        {/* HEADER */}
        <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6">
          <div className="opacity-95">
            <CardTitle className="text-2xl font-bold">Create New Reservation</CardTitle>
            <p className="text-sm opacity-90 mt-1">
              Fill the details to create a new table reservation.
            </p>
          </div>
        </CardHeader>

        {/* FORM CONTENT */}
        <CardContent className="p-6 grid grid-cols-2 gap-6">
          {/* Customer */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Customer Name</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="transition-shadow duration-200 focus:shadow-outline"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="transition-shadow duration-200 focus:shadow-outline"
            />
          </div>

          {/* Email */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Guests */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Guests</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(maxGuests)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} Guest{i > 0 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date (Zomato-style) */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Date</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-start gap-3 text-left font-medium transition transform hover:scale-105"
                >
                  <span className="group inline-flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5 text-gray-600 transition-colors duration-200 group-hover:text-white group-hover:scale-110" />
                  </span>
                  <span className="flex-1">
                    {date ? format(date, "PPP") : "Pick a date"}
                  </span>
                </Button>
              </PopoverTrigger>

              {/* PopoverContent with fixed width and proper styling */}
              <PopoverContent
                align="start"
                className="p-0 w-auto rounded-xl shadow-lg border bg-white"
              >
                <div
                  ref={popoverRef}
                  className="p-4 rounded-lg bg-white"
                  style={{ minWidth: 320 }}
                >
                  {/* Mini header for Zomato style */}
                  <div className="mb-3 px-2">
                    <div className="text-sm text-gray-500">Select a date</div>
                    <div className="text-xs text-gray-400">
                      Past dates are disabled
                    </div>
                  </div>

                  {/* Calendar: we intercept selection to disable past dates */}
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => handleDateSelect(d)}
                    // If your Calendar supports "disabled" prop or "from" prop, you can pass a minDate.
                    // Many implementations accept a "from" prop; if available, uncomment:
                    // from={today}
                    className="rounded-md"
                  />

                  {/* quick actions */}
                  <div className="mt-3 flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setDate(new Date())}
                      className="text-sm px-3 py-1 rounded-md hover:bg-gray-100 transition"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDate(undefined)}
                      className="text-sm px-3 py-1 rounded-md hover:bg-gray-100 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select Time" />
              </SelectTrigger>
              <SelectContent>
                {dynamicTimeSlots.length === 0 ? (
                  <div className="p-2 text-gray-400 text-sm">No available slots</div>
                ) : (
                  dynamicTimeSlots.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Slot range: <strong>{settingsStartTimeRaw}</strong> →{" "}
              <strong>{settingsEndTimeRaw}</strong> ({slotInterval}m)
            </p>
          </div>

          {/* Table */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Table</Label>
            <Select value={table} onValueChange={setTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                {settingsTables.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name} — {t.capacity} seats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2 transform transition hover:scale-[1.01]">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Special Requests */}
          <div className="col-span-2 space-y-2 transform transition hover:scale-[1.01]">
            <Label>Special Requests</Label>
            <Textarea
              rows={3}
              className="resize-none"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>
        </CardContent>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            Cancel
          </Button>

          <button
            onClick={handleCreate}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 py-2 shadow-md transition transform active:scale-95"
          >
            Create Reservation
          </button>
        </div>
      </Card>

      {/* small inline styles for the shake animation (Tailwind doesn't include shake by default) */}
      <style jsx>{`
        @keyframes shakeX {
          0% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shakeX 360ms ease-in-out;
        }
        /* subtle focus shadow used for inputs */
        .focus\\:shadow-outline:focus {
          box-shadow: 0 6px 18px rgba(255, 159, 67, 0.12);
          outline: none;
        }
      `}</style>
    </div>
  );
}
