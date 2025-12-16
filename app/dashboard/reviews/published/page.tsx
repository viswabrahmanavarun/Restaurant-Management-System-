"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Star,
  User,
  ClipboardList,
  MessageSquare,
  Loader2,
  Trash2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

export default function PublishedReviewsPage() {
  const [publishedReviews, setPublishedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // Fetch published reviews
  // ============================
  useEffect(() => {
    async function fetchPublishedReviews() {
      try {
        const res = await fetch("/api/reviews/published");
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setPublishedReviews(data.reviews);
        }
      } catch (error) {
        console.error("Error fetching published reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPublishedReviews();
  }, []);

  // ============================
  // Handle Delete
  // ============================
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/reviews/published`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "✅ Review deleted successfully!" });
        setPublishedReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast({ title: "❌ Failed to delete review", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "⚠️ Error deleting review", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="published" className="w-full">
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger
            value="all"
            onClick={() => (window.location.href = "/dashboard/reviews")}
          >
            All Reviews
          </TabsTrigger>
          <TabsTrigger value="published">Published Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          {publishedReviews.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">
              No published reviews yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedReviews.map((review) => (
                <Card
                  key={review.id}
                  className="bg-purple-50 border border-purple-300 shadow-sm hover:shadow-md hover:border-purple-400 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <CardHeader>
                      <CardTitle className="text-center text-lg font-semibold text-purple-900">
                        {review.orderNumber}
                      </CardTitle>
                      <div className="flex justify-center">
                        <span className="px-3 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full">
                          PUBLISHED
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-gray-800 flex items-center gap-2">
                        <User size={16} className="text-purple-600" />{" "}
                        <b>{review.customerName}</b>
                      </p>
                      <p className="text-sm text-gray-800 flex items-center gap-2 mb-3">
                        <ClipboardList size={16} className="text-purple-600" />{" "}
                        Table: -
                      </p>

                      {review.orderDetails ? (
                        <div className="bg-purple-100 rounded-md p-2 mb-3">
                          <div className="flex items-center mb-2 text-purple-800 font-semibold">
                            <ClipboardList className="w-4 h-4 mr-2 text-purple-700" />
                            Items
                          </div>
                          {review.orderDetails.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm border-b border-purple-200 py-1"
                            >
                              <span>
                                {item.quantity} × {item.itemName}
                              </span>
                              <span>₹{item.price}</span>
                            </div>
                          ))}
                          <p className="font-semibold text-right text-purple-900 mt-2">
                            Total Amount: ₹{review.orderDetails.totalAmount}
                          </p>
                        </div>
                      ) : (
                        <p className="italic text-gray-500">
                          (Order details unavailable)
                        </p>
                      )}

                      {/* Rating & Comment */}
                      <div className="mt-2">
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              fill={review.rating >= s ? "currentColor" : "none"}
                              className={
                                review.rating >= s
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <p className="flex items-start gap-2 text-gray-700 mt-2">
                          <MessageSquare size={16} className="text-purple-600" />{" "}
                          {review.comment}
                        </p>
                      </div>
                    </CardContent>
                  </div>

                  {/* 🗑️ Dustbin icon bottom-right */}
                  <div className="flex justify-end p-3">
                    <Trash2
                      size={20}
                      className="text-red-600 cursor-pointer hover:text-red-800 transition"
                      onClick={() => handleDelete(review.id)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
