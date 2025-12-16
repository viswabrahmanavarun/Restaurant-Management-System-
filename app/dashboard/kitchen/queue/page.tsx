"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type KOTStatus = "NEW" | "IN_QUEUE" | "READY" | "COMPLETED";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
  kotStatus: KOTStatus;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  tableNumber?: string | null;
  totalAmount?: number;
  items: OrderItem[];
};

const STATUS_STYLES = {
  IN_QUEUE: {
    bg: "#fde9b0",
    border: "#f5d57b",
    badgeBg: "#ffe8a3",
    badgeText: "#7a5d00",
  },
  READY: {
    bg: "#eedcff",
    border: "#d8baf8",
    badgeBg: "#e6d1ff",
    badgeText: "#5a00a0",
  },
};

export default function KitchenQueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const firstPayloadReceived = useRef(false);

  useEffect(() => {
    let es: EventSource | null = null;

    function startSSE() {
      es = new EventSource("/api/orders/stream");

      es.onmessage = (ev) => {
        if (!ev.data) return;

        try {
          const parsed = JSON.parse(ev.data);

          if (Array.isArray(parsed)) {
            setOrders(parsed);
            setLoading(false);
            return;
          }

          if (parsed?.type === "ORDER_UPDATED") {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === parsed.payload.id ? parsed.payload : o
              )
            );
            return;
          }

          if (parsed?.type === "NEW_ORDER") {
            setOrders((prev) => [parsed.payload, ...prev]);
            return;
          }
        } catch (_) {}
      };
    }

    startSSE();
    return () => es?.close();
  }, []);

  // Only IN_QUEUE items
  const visibleOrders = useMemo(
    () =>
      orders.filter((o) =>
        o.items.some((it) => it.kotStatus === "IN_QUEUE")
      ),
    [orders]
  );

  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      <div className="max-w-[1300px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Kitchen – Queue
        </h1>

        {loading && (
          <div className="text-center py-20 text-gray-600 text-lg">
            Loading orders...
          </div>
        )}

        {!loading && visibleOrders.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-lg">
            No items in queue.
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {visibleOrders.map((order) => {
            const styles = STATUS_STYLES.IN_QUEUE;

            return (
              <div
                key={order.id}
                className="rounded-2xl p-4 shadow border"
                style={{
                  background: styles.bg,
                  borderColor: styles.border,
                }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="font-bold text-lg">{order.orderNumber}</h2>
                    <p className="text-sm">👤 {order.customerName}</p>
                    <p className="text-sm">🍽️ Table: {order.tableNumber}</p>
                  </div>

                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: styles.badgeBg,
                      color: styles.badgeText,
                    }}
                  >
                    IN QUEUE
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items
                    .filter((it) => it.kotStatus === "IN_QUEUE")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white border rounded-xl p-3 shadow-sm"
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        )}

                        <div className="flex-1">
                          <p className="font-semibold">{item.itemName}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-3 border-t text-right">
                  <p className="text-sm text-gray-700">Total Amount:</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
