"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReservationModal({ open, onClose }: ModalProps) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [table, setTable] = useState("Table 1");
  const [special, setSpecial] = useState("");

  if (!open) return null;

  const saveReservation = async () => {
    if (!customerName || !phone || !guests || !date || !time) {
      alert("Please fill all required fields");
      return;
    }

    const newReservation = {
      id: "RES-" + Math.floor(Math.random() * 90000 + 10000),
      customerName,
      phone,
      email,
      guests: Number(guests),
      date,
      time,
      table,
      status: "PENDING",
      specialRequests: special,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("/api/reservation/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReservation),
    });

    if (!res.ok) {
      alert("Failed to save reservation!");
      return;
    }

    alert("Reservation saved successfully!");
    onClose();

    // DO NOT REDIRECT → Stay in homepage
  };

  return (
    <>
      {/* Blur Background */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="fixed top-1/2 left-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2 p-6 shadow-xl rounded-xl bg-white">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Reserve a Table
        </h2>

        <div className="space-y-3">
          <Input
            placeholder="Customer Name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <Input
            placeholder="Phone Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="Total Guests *"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />

          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

          {/* TABLE SELECTOR ADDED */}
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          >
            <option>Table 1</option>
            <option>Table 2</option>
            <option>Table 3</option>
            <option>Table 4</option>
          </select>

          <Textarea
            placeholder="Special Requests"
            value={special}
            onChange={(e) => setSpecial(e.target.value)}
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={saveReservation}>
              Save
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
