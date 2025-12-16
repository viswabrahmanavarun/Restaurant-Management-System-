"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import ReservationsTable from "./ReservationsTable";
import { useToast } from "@/components/ui/use-toast";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  ListChecks,
} from "lucide-react";

export type ReservationType = {
  id: string;
  reservationId?: string;
  customerName: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt?: string;
  notes?: string;
};

export default function ReservationsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "TODAY" | "PENDING" | "CONFIRMED"
  >("ALL");
  const [loading, setLoading] = useState(true);

  const todayDate = new Date().toISOString().split("T")[0];

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reservation/get");

      if (!res.ok) {
        toast({
          title: "Failed to load reservations",
          description: "Server error occurred",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const data: ReservationType[] = await res.json();

      const normalized = data.map((d) => ({
        ...d,
        date: d.date ? d.date.split("T")[0] : todayDate,
      }));

      setReservations(normalized);
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to connect to the server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 6000);
    return () => clearInterval(interval);
  }, []);

  const totals = useMemo(() => {
    return {
      total: reservations.length,
      today: reservations.filter((r) => r.date === todayDate).length,
      confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
      pending: reservations.filter((r) => r.status === "PENDING").length,
    };
  }, [reservations, todayDate]);

  const filteredReservations = useMemo(() => {
    switch (activeTab) {
      case "TODAY":
        return reservations.filter((r) => r.date === todayDate);
      case "PENDING":
        return reservations.filter((r) => r.status === "PENDING");
      case "CONFIRMED":
        return reservations.filter((r) => r.status === "CONFIRMED");
      case "ALL":
      default:
        return reservations;
    }
  }, [reservations, activeTab, todayDate]);

  const handleCardClick = (
    tab: "ALL" | "TODAY" | "PENDING" | "CONFIRMED"
  ) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Reservation Management
          </h1>
          <p className="text-gray-600 text-sm">
            Track and manage restaurant reservations in real-time
          </p>
        </div>

        {/* Only Create Reservation Button now */}
        <div>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition"
            onClick={() => router.push("/dashboard/reservations/new")}
          >
            + Create Reservation
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border border-red-100 bg-red-50"
          onClick={() => handleCardClick("TODAY")}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-red-700 text-sm font-medium">
              Today
            </CardTitle>
            <CalendarDays className="text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-red-700">
              {totals.today}
            </p>
            <p className="mt-1 text-xs text-gray-500">Reservations for today</p>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border border-green-100 bg-green-50"
          onClick={() => handleCardClick("CONFIRMED")}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-green-700 text-sm font-medium">
              Confirmed
            </CardTitle>
            <CheckCircle className="text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-green-700">
              {totals.confirmed}
            </p>
            <p className="mt-1 text-xs text-gray-500">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border border-yellow-100 bg-yellow-50"
          onClick={() => handleCardClick("PENDING")}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-yellow-700 text-sm font-medium">
              Pending
            </CardTitle>
            <Clock className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-yellow-700">
              {totals.pending}
            </p>
            <p className="mt-1 text-xs text-gray-500">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border border-blue-100 bg-blue-50"
          onClick={() => handleCardClick("ALL")}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-blue-700 text-sm font-medium">
              Total
            </CardTitle>
            <ListChecks className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-blue-700">
              {totals.total}
            </p>
            <p className="mt-1 text-xs text-gray-500">All reservations</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-4 bg-white rounded-xl shadow border overflow-hidden">
          <TabsTrigger
            value="ALL"
            className="py-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-sm font-medium"
          >
            All
          </TabsTrigger>

          <TabsTrigger
            value="TODAY"
            className="py-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-sm font-medium"
          >
            Today
          </TabsTrigger>

          <TabsTrigger
            value="PENDING"
            className="py-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-sm font-medium"
          >
            Pending
          </TabsTrigger>

          <TabsTrigger
            value="CONFIRMED"
            className="py-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-sm font-medium"
          >
            Confirmed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">
                {activeTab} Reservations
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500 py-4">
                  Loading reservations...
                </p>
              ) : (
                <ReservationsTable reservations={filteredReservations} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
