"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string | null;
  totalAmount: number;
  status: string;
  items: OrderItem[];
};

type Review = {
  id: string;
  orderId?: string | null;
  status: string;
};

export default function PendingReviewsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // 1️⃣ Fetch all completed orders
        const ordersRes = await fetch("/api/orders");
        const ordersJson = await ordersRes.json();

        const allOrders = Array.isArray(ordersJson)
          ? ordersJson
          : Array.isArray(ordersJson.orders)
          ? ordersJson.orders
          : [];

        const completedOrders = allOrders.filter(
          (order: Order) => order.status?.toLowerCase() === "completed"
        );

        // 2️⃣ Fetch all reviews
        const reviewsRes = await fetch("/api/reviews");
        const reviewsJson = await reviewsRes.json();
        const reviews: Review[] = reviewsJson.reviews || [];

        // 3️⃣ Remove orders that already have a review
        const pendingOrders = completedOrders.filter(
          (order: Order) =>
            !reviews.some((rev) => rev.orderId === order.id)
        );

        setOrders(pendingOrders);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        No pending reviews. Good job! 🎉
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order) => (
        <Card key={order.id} className="border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">
              {order.orderNumber}
            </CardTitle>
            <div className="flex justify-center">
              <span className="px-3 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full">
                COMPLETED
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm">
              <strong>Customer:</strong> {order.customerName}
            </p>
            <p className="text-sm mb-3">
              <strong>Table:</strong> {order.tableNumber || "-"}
            </p>

            <div className="bg-green-100 rounded-md p-2 mb-3">
              <div className="flex items-center mb-2">
                <ClipboardList className="w-4 h-4 mr-2" />
                <strong>Items</strong>
              </div>

              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm border-b border-green-200 py-1"
                >
                  <span>
                    {item.quantity} × {item.itemName}
                  </span>
                  <span>₹{item.price}</span>
                </div>
              ))}
            </div>

            <p className="font-semibold text-right mb-3">
              Total Amount: ₹{order.totalAmount}
            </p>

            {/* BUTTON */}
            <div className="flex justify-center">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() =>
                  router.push(`/dashboard/reviews/add?orderId=${order.id}`)
                }
              >
                Write Review
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
