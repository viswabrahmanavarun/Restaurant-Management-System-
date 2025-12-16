"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, CheckCircle } from "lucide-react";
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

export default function PaymentPendingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all PAYMENT_PENDING orders
  async function fetchPaymentPendingOrders() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (data.success) {
        const filtered = data.orders.filter(
          (order: Order) => order.status === "PAYMENT_PENDING"
        );
        setOrders(filtered);
      }
    } catch (error) {
      console.error("❌ Error fetching payment pending orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPaymentPendingOrders();

    // ✅ Real-time SSE updates
    const eventSource = new EventSource("/api/sse");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "ORDER_UPDATED") {
        const updated = data.payload;
        setOrders((prev) => {
          // Remove if no longer PAYMENT_PENDING
          if (updated.status !== "PAYMENT_PENDING") {
            return prev.filter((o) => o.id !== updated.id);
          }

          // Add or update if still PAYMENT_PENDING
          const exists = prev.find((o) => o.id === updated.id);
          if (exists) {
            return prev.map((o) => (o.id === updated.id ? updated : o));
          } else {
            return [updated, ...prev];
          }
        });
      }
    };

    return () => eventSource.close();
  }, []);

  // ✅ Handle payment completion
  const handlePaymentCompleted = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (!res.ok) throw new Error("Failed to mark payment completed");

      toast({
        title: "✅ Payment Completed",
        description: "Order has been marked as completed successfully.",
      });

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error("❌ Error marking payment completed:", error);
      toast({
        title: "❌ Error",
        description: "Failed to mark payment completed.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-10">
        No orders with pending payment.
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="border-2 border-red-500 rounded-xl shadow-sm"
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
            {/* 🔴 Red badge for PAYMENT_PENDING */}
            <Badge className="bg-red-100 text-red-800">
              {order.status}
            </Badge>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {/* ✅ Order Items */}
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

            {/* ✅ Total */}
            <div className="flex justify-between items-center font-semibold mt-3">
              <span>Total Amount:</span>
              <span>₹{order.totalAmount}</span>
            </div>

            {/* ✅ Payment Completed Button */}
            <Button
              onClick={() => handlePaymentCompleted(order.id)}
              className="w-full bg-green-600 text-white hover:bg-green-700 mt-3"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Payment Completed
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
