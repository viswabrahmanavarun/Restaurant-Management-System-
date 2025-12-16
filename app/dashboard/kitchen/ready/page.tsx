"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, RefreshCcw, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  imageUrl?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
};

export default function ReadyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch READY Orders
  async function fetchReadyOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (data.success) {
        const readyOrders = data.orders.filter(
          (order: Order) => order.status === "READY"
        );
        setOrders(readyOrders);
        setFiltered(readyOrders);
      }
    } catch (error) {
      console.error("❌ Error fetching ready orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReadyOrders();

    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "ORDER_UPDATED") {
        const updated = data.payload;

        setOrders((prev) => {
          if (updated.status !== "READY") {
            return prev.filter((o) => o.id !== updated.id);
          }

          const exists = prev.find((o) => o.id === updated.id);

          if (exists) {
            return prev.map((o) => (o.id === updated.id ? updated : o));
          }

          return [updated, ...prev];
        });
      }
    };

    return () => eventSource.close();
  }, []);

  // Payment Pending Action
  const handlePaymentPending = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAYMENT_PENDING" }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      toast({
        title: "💰 Payment Pending",
        description: `Order moved to Payment Pending successfully.`,
      });

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error("❌ Error:", error);
      toast({
        title: "❌ Error",
        description: "Failed to move order.",
        variant: "destructive",
      });
    }
  };

  // Search & Filters
  useEffect(() => {
    let list = [...orders];

    // Search by name or order number
    if (search.trim() !== "") {
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(search.toLowerCase()) ||
          o.orderNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Additional filters
    if (activeFilter === "high") {
      list = list.filter((o) => o.totalAmount > 300);
    }

    setFiltered(list);
  }, [search, activeFilter, orders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* 🔥 TOP TITLE BAR */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          📦 Ready Orders
          <Badge className="bg-green-100 text-green-900">
            {filtered.length}
          </Badge>
        </h1>

        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="flex items-center gap-2 border rounded-lg bg-white px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search orders..."
              className="outline-none text-sm w-40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Refresh Button */}
          <Button
            onClick={fetchReadyOrders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* 🔥 FILTER BUTTONS */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          onClick={() => setActiveFilter("all")}
        >
          All
        </Button>

        <Button
          variant={activeFilter === "high" ? "default" : "outline"}
          onClick={() => setActiveFilter("high")}
        >
          High Amount (₹300+)
        </Button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground mt-10">
          No matching orders found.
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((order) => (
          <Card
            key={order.id}
            className="border-2 border-green-500 rounded-xl shadow-sm"
          >
            <CardHeader className="flex justify-between items-center border-b pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {order.orderNumber}
                </CardTitle>
                <div className="flex items-center gap-2 text-gray-700 mt-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{order.customerName}</span>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 border rounded-md p-2 bg-gray-50"
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.itemName}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center font-semibold mt-3">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount}</span>
              </div>

              {/* Payment Pending Button */}
              <Button
                onClick={() => handlePaymentPending(order.id)}
                className="w-full bg-yellow-500 text-white hover:bg-yellow-600 mt-3"
              >
                💰 Payment Pending
              </Button>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
