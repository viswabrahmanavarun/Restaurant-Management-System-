"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ClipboardList, Star } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  menuItemId: any;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
}

export default function AddReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [comment, setComment] = useState("");

  const maxStars = 5;

  /* ------------------------------------------------------------
     LOAD ORDER
  ------------------------------------------------------------ */
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return setLoading(false);

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (data.success) {
          const normalizedItems = data.order.items.map((item: any) => ({
            ...item,
            menuItemId:
              typeof item.menuItemId === "object"
                ? item.menuItemId?.toString()
                : item.menuItemId,
          }));

          setOrder({
            ...data.order,
            items: normalizedItems,
          });

          const initial: any = {};
          normalizedItems.forEach((item) => {
            if (item.menuItemId) initial[item.menuItemId] = 0;
          });

          setRatings(initial);
        } else {
          toast({ title: "Order not found", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error loading order", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  /* ------------------------------------------------------------
     SUBMIT REVIEW
  ------------------------------------------------------------ */
  async function handleSubmit() {
    if (!comment.trim()) {
      toast({ title: "Please write a review comment." });
      return;
    }

    try {
      let submittedCount = 0;

      for (const item of order!.items) {
        if (!item.menuItemId) continue;

        const id =
          typeof item.menuItemId === "object"
            ? item.menuItemId.toString()
            : item.menuItemId;

        const ratingValue = ratings[id];
        if (!ratingValue) continue;

        const res = await fetch(`/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            menuItemId: id,
            rating: ratingValue,
            comment,
            customerName: order!.customerName,
          }),
        });

        const body = await res.json();
        if (body.success) submittedCount++;
      }

      toast({
        title: "Review submitted",
        description: `${submittedCount} item(s) reviewed.`,
      });

      router.push("/dashboard/reviews");
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    }
  }

  /* ------------------------------------------------------------
     LOADING UI
  ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="h-[60vh] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-10 text-red-600">Invalid review link.</div>
    );
  }

  /* ------------------------------------------------------------
     PAGE UI
  ------------------------------------------------------------ */
  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-lg border border-green-500 bg-green-50 shadow-lg rounded-xl">
        {/* HEADER */}
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-green-900">
            {order.orderNumber}
          </CardTitle>

          <div className="bg-green-300 text-xs px-4 py-1 rounded-full inline-block mt-2 font-semibold">
            {order.status}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent>
          {/* ORDER ITEMS */}
          <div className="bg-green-100 p-4 rounded-lg mb-4 border border-green-300">
            <div className="flex items-center mb-3 font-semibold text-green-800">
              <ClipboardList className="w-4 h-4 mr-2" /> Items
            </div>

            {order.items.map((item) => {
              const menuId =
                typeof item.menuItemId === "object"
                  ? item.menuItemId.toString()
                  : item.menuItemId;

              return (
                <div
                  key={item.id}
                  className="mb-4 pb-3 border-b border-green-300 last:border-none"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-green-900">
                      {item.quantity} × {item.itemName}
                    </span>
                    <span className="font-semibold text-green-700">
                      ₹{item.price}
                    </span>
                  </div>

                  {/* STARS */}
                  {menuId ? (
                    <div className="flex mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 cursor-pointer transition ${
                            star <= (ratings[menuId] || 0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400"
                          }`}
                          onClick={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [menuId]: star,
                            }))
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 mt-2">
                      ⚠ Cannot review this item — missing menu reference.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* COMMENT */}
          <Textarea
            placeholder="Write your overall review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3 bg-white"
          />

          {/* SUBMIT BUTTON */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
          >
            Submit Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
