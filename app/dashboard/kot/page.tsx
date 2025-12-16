"use client";

import { useEffect, useState } from "react";

type KOTItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  kotStatus: string;
  order: {
    orderNumber: string;
    customerName: string;
    tableNumber?: string | null;
  };
};

const badgeColors: Record<string, string> = {
  NEW: "bg-blue-200 text-blue-800",
  IN_QUEUE: "bg-yellow-200 text-yellow-800",
  READY: "bg-green-200 text-green-800",
  COMPLETED: "bg-gray-300 text-gray-700",
};

export default function KOTPage() {
  const [items, setItems] = useState<KOTItem[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/kot/stream");

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // ITEM UPDATED
        if (data.type === "KOT_UPDATED") {
          setItems((prev) =>
            prev.map((i) => (i.id === data.item.id ? data.item : i))
          );
          return;
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    return () => es.close();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/kot/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">KOT Dashboard</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-xl shadow border"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg">
                {item.order.orderNumber}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColors[item.kotStatus]}`}
              >
                {item.kotStatus}
              </span>
            </div>

            <p className="text-gray-700 text-sm">
              👤 {item.order.customerName}
            </p>
            <p className="text-gray-700 text-sm mb-3">
              🍽 Table: {item.order.tableNumber || "-"}
            </p>

            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="font-medium">{item.itemName}</p>
              <p className="text-sm text-gray-600">
                Qty: {item.quantity} × ₹{item.price}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {item.kotStatus === "NEW" && (
                <button
                  onClick={() => updateStatus(item.id, "IN_QUEUE")}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                  Start
                </button>
              )}
              {item.kotStatus === "IN_QUEUE" && (
                <button
                  onClick={() => updateStatus(item.id, "READY")}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg"
                >
                  Ready
                </button>
              )}
              {item.kotStatus === "READY" && (
                <button
                  onClick={() => updateStatus(item.id, "COMPLETED")}
                  className="w-full bg-green-600 text-white py-2 rounded-lg"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
