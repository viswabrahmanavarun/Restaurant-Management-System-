"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: "NEW" | "IN_QUEUE" | "READY" | "PAYMENT_PENDING" | "COMPLETED";
  items: OrderItem[];
};

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/orders/stream");

    eventSource.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        // 1️⃣ INIT message → contains full orders list
        if (msg.type === "INIT" && Array.isArray(msg.orders)) {
          const newOrders = msg.orders.filter(
            (o: Order) => o.status === "NEW"
          );
          setOrders(newOrders);
          return;
        }

        // 2️⃣ ORDER_UPDATED → update single order
        if (msg.type === "ORDER_UPDATED" && msg.order) {
          setOrders((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((o) => o.id === msg.order.id);

            if (msg.order.status === "NEW") {
              // If not already present, add it
              if (idx === -1) updated.unshift(msg.order);
            } else {
              // Remove if moved out of NEW
              if (idx !== -1) updated.splice(idx, 1);
            }

            return updated;
          });

          return;
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const handleStartPreparing = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_QUEUE" }),
      });

      if (res.ok) {
        console.log(`Order ${orderId} moved to IN_QUEUE`);
      } else {
        alert("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Pending Orders
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No pending orders right now.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-2 border-red-500 shadow-sm rounded-lg"
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

                <Badge className="bg-red-100 text-red-800">
                  {order.status}
                </Badge>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.itemName}
                            width={50}
                            height={50}
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
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center font-semibold mt-3">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount}</span>
                </div>

                <Button
                  onClick={() => handleStartPreparing(order.id)}
                  className="w-full bg-black text-white hover:bg-gray-800 mt-3"
                >
                  Start Preparing
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
