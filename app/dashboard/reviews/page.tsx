"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Star,
  User,
  ClipboardList,
  MessageSquare,
  Loader2,
  ShieldAlert,
  UploadCloud,
  Home,
  Check,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

/* ============================================================
   MAIN PAGE
============================================================ */
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] =
    useState<"ALL" | "PUBLISHED" | "SPAM" | "PENDING">("ALL");

  const userRole = "ADMIN";

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();

        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  /* ============================================================
     PUBLISH or SPAM ACTION
  ============================================================= */
  const handleAction = async (id: string, action: "publish" | "spam") => {
    try {
      const res = await fetch(`/api/reviews/${id}/${action}`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title:
            action === "publish"
              ? "Review published successfully 🟢"
              : "Marked as spam 🔴",
        });

        setReviews((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: action === "publish" ? "PUBLISHED" : "SPAM" }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  /* ============================================================
     POST TO HOME PAGE
  ============================================================= */
  const postToHome = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}/post`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Posted to homepage 🏠" });

        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, showOnHome: true } : r))
        );
      }
    } catch (err) {
      toast({
        title: "Error posting review",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-10 h-10 text-purple-600" />
      </div>
    );
  }

  const filteredReviews =
    filter === "ALL" ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div className="p-6">
      <Tabs defaultValue="all">
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger value="all" onClick={() => setFilter("ALL")}>
            All
          </TabsTrigger>

          <TabsTrigger value="published" onClick={() => setFilter("PUBLISHED")}>
            Published
          </TabsTrigger>

          <TabsTrigger value="spam" onClick={() => setFilter("SPAM")}>
            Spam
          </TabsTrigger>

          <TabsTrigger value="pending" onClick={() => setFilter("PENDING")}>
            Pending
          </TabsTrigger>
        </TabsList>

        {/* All sections */}
        <TabsContent value="all">
          <ReviewsGrid
            reviews={filteredReviews}
            userRole={userRole}
            handleAction={handleAction}
            postToHome={postToHome}
          />
        </TabsContent>

        <TabsContent value="published">
          <ReviewsGrid
            reviews={filteredReviews}
            userRole={userRole}
            handleAction={handleAction}
            postToHome={postToHome}
          />
        </TabsContent>

        <TabsContent value="spam">
          <ReviewsGrid
            reviews={filteredReviews}
            userRole={userRole}
            handleAction={handleAction}
            postToHome={postToHome}
          />
        </TabsContent>

        <TabsContent value="pending">
          <ReviewsGrid
            reviews={filteredReviews}
            userRole={userRole}
            handleAction={handleAction}
            postToHome={postToHome}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============================================================
   REVIEW GRID
============================================================ */
function ReviewsGrid({
  reviews,
  userRole,
  handleAction,
  postToHome,
}: {
  reviews: any[];
  userRole: string;
  handleAction: (id: string, action: "publish" | "spam") => void;
  postToHome: (id: string) => void;
}) {
  if (reviews.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">No reviews found.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {reviews.map((review) => {
        const order = review.order;   // ⭐ FIX: read actual order from backend

        const statusColor =
          review.status === "SPAM"
            ? "bg-red-50 border-red-300"
            : review.status === "PUBLISHED"
            ? "bg-green-50 border-green-300"
            : "bg-yellow-50 border-yellow-300";

        const badgeColor =
          review.status === "PUBLISHED"
            ? "bg-green-200 text-green-800"
            : review.status === "SPAM"
            ? "bg-red-200 text-red-800"
            : "bg-yellow-200 text-yellow-800";

        return (
          <Card key={review.id} className={`${statusColor} border shadow-sm rounded-2xl p-3`}>
            <CardHeader className="relative">
              <CardTitle className="text-center text-lg font-bold">
                {review.orderNumber ?? "ORD-???"}
              </CardTitle>

              <div className="flex justify-center mt-1">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badgeColor}`}>
                  {review.status}
                </span>
              </div>

              {/* ADMIN ACTIONS */}
              {userRole === "ADMIN" && (
                <div className="absolute top-3 right-3 flex gap-2">
                  
                  {/* Publish */}
                  <button
                    onClick={() => handleAction(review.id, "publish")}
                    disabled={review.status === "PUBLISHED"}
                    className="p-2 rounded-full border hover:bg-green-100"
                  >
                    <UploadCloud className="w-4 h-4 text-green-700" />
                  </button>

                  {/* Spam */}
                  <button
                    onClick={() => handleAction(review.id, "spam")}
                    disabled={review.status === "SPAM"}
                    className="p-2 rounded-full border hover:bg-red-100"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-700" />
                  </button>

                  {/* Post to home */}
                  {review.status === "PUBLISHED" && !review.showOnHome && (
                    <button
                      onClick={() => postToHome(review.id)}
                      className="p-2 rounded-full border hover:bg-blue-100"
                    >
                      <Home className="w-4 h-4 text-blue-700" />
                    </button>
                  )}

                  {review.showOnHome && (
                    <div className="p-2 rounded-full border bg-blue-200">
                      <Check className="w-4 h-4 text-blue-800" />
                    </div>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Customer */}
              <p className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <b>{review.customerName}</b>
              </p>

              {/* ORDER DETAILS FIX */}
              {!order && (
                <p className="italic text-gray-500">(Order details unavailable)</p>
              )}

              {order && (
                <div className="p-3 rounded-lg bg-white border">
                  <div className="flex items-center mb-2 font-semibold text-purple-700">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Items
                  </div>

                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm py-1 border-b last:border-none"
                    >
                      <span>
                        {item.quantity} × {item.itemName}
                      </span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}

                  <p className="font-semibold text-right text-purple-900 mt-2">
                    Total Amount: ₹{order.totalAmount}
                  </p>
                </div>
              )}

              {/* Stars */}
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      review.rating >= s
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 flex gap-2">
                <MessageSquare className="w-4 h-4 text-purple-700" />
                {review.comment}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================================================
   EXTRA CSS
============================================================ */
<style jsx global>{`
  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(12px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.35s ease forwards;
  }
`}</style>
