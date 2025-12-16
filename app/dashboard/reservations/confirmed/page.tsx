"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import ReservationsTable from "../ReservationsTable";
import { ReservationType } from "../ReservationsTable";

export default function ConfirmedReservationsPage() {
  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfirmed = async () => {
    try {
      const res = await fetch("/api/reservation/get");
      if (!res.ok) {
        console.error("Failed to fetch reservations:", await res.text());
        setLoading(false);
        return;
      }
      const data: ReservationType[] = await res.json();
      setReservations(data.filter(r => r.status === "CONFIRMED"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmed();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto my-8">
      <Card>
        <CardHeader>
          <CardTitle>Confirmed Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading confirmed reservations...</p>
          ) : (
            <ReservationsTable reservations={reservations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
