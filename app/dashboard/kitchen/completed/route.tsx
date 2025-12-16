"use client";

import { useEffect, useMemo, useState } from "react";

type KOTStatus = "NEW" | "IN_QUEUE" | "READY" | "COMPLETED";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  image?: string | null;
  kotStatus: KOTStatus;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber?: string | null;
  totalAmount?: number;
  items: OrderItem[];
};

const HERO_IMAGE = "sandbox:/mnt/data/49b3c717-cf82-44fa-846c-6812ff63ad3d.png";

const statusStyles: Record<string, string> = {
  READY: "bg-purple-100 border-purple-300",
  COMPLETED: "bg-gray-100 border-gray-300",
};

const statusBadge: Record<string, string> = {
  READY: "bg-purple-200 text-purple-800",
  COMPLETED: "bg-gray-200 text-gray-800",
};

export default function KitchenCompletedPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const es = new EventSource("/api/orders/stream");
    es.onmessage = (e) => {
      try {
        const data: Order[] = JSON.parse(e.data);
        setOrders(data);
      } catch (err) {
        console.error("SSE parse error (completed):", err);
      } finally {
        setLoading(false);
      }
    };
    es.onerror = (err) => {
      console.error("EventSource error:", err);
      es.close();
    };
    return () => es.close();
  }, []);

  // visible if item is READY or COMPLETED
  const visible = useMemo(() => orders.filter((o) => o.items.some((it) => it.kotStatus === "READY" || it.kotStatus === "COMPLETED")), [orders]);

  const markComplete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/kot/confirmReady/${itemId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setOrders((prev) =>
        prev.map((o) => ({
          ...o,
          items: o.items.map((it) => (it.id === itemId ? { ...it, kotStatus: "COMPLETED" } : it)),
        }))
      );
    } catch (err) {
      console.error("markComplete failed:", err);
      alert("Could not mark completed.");
    }
  };

  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      <div className="max-w-[1300px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kitchen — Ready / Completed</h1>
            <p className="text-sm text-gray-600 mt-1">Items ready to be served or already completed.</p>
          </div>

          <div className="hidden md:block">
            <img src={HERO_IMAGE} alt="hero" className="w-[220px] h-14 object-cover rounded-md shadow-sm" />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && visible.length === 0 && <div className="text-center text-gray-500 py-20">No ready/completed items.</div>}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((order) => {
            const badge = order.items.some((it) => it.kotStatus === "READY") ? "READY" : "COMPLETED";
            return (
              <div key={order.id} className={`border-2 rounded-2xl shadow-md p-4 transition-all hover:shadow-lg ${statusStyles[badge]}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="font-bold text-lg">{order.orderNumber}</h2>
                    <div className="text-sm text-gray-700 mt-1">
                      <div>👤 {order.customerName || "Unknown"}</div>
                      <div>🍽️ Table: <span className="font-medium">{order.tableNumber ?? "-"}</span></div>
                    </div>
                  </div>

                  <div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge[badge]}`}>{badge.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.filter((it) => it.kotStatus === "READY" || it.kotStatus === "COMPLETED").map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/60 border rounded-lg p-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.itemName}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity} • ₹{item.price}</div>
                      </div>

                      <div className="ml-3 flex items-center gap-2">
                        {item.kotStatus === "READY" ? (
                          <button onClick={() => markComplete(item.id)} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                            Mark Completed
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-sm">COMPLETED</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-3 text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="font-semibold text-lg">₹{Number(order.totalAmount ?? 0).toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
