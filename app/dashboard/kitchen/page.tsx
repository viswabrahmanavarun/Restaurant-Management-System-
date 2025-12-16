"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X, LayoutGrid, Table } from "lucide-react";
import clsx from "clsx";

const FALLBACK_IMAGE = "/mnt/data/d6410847-80d8-45df-b1b8-8ec67eb32275.png";

/* ============================================================
   TYPES
============================================================ */
type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price?: number;
  imageUrl?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  totalAmount: number;
  status: string;
  tableNumber?: string | null;
  items: OrderItem[];
  createdAt?: string;
};

type NoteType = "start" | "ready" | "error";

const ALL_TABS = [
  "ALL",
  "NEW",
  "PLACED",
  "IN_QUEUE",
  "READY",
  "PAYMENT_PENDING",
  "COMPLETED",
];

/* ============================================================
   STATUS COLORS
============================================================ */
const STATUS_COLORS: Record<string, any> = {
  NEW: { cardBg: "#dceaff", border: "#9dbdf8", badgeBg: "#dceaff", badgeText: "#1f4fa3", badgeBorder: "#9dbdf8" },
  PLACED: { cardBg: "#e0ffe0", border: "#9be79b", badgeBg: "#e0ffe0", badgeText: "#176917", badgeBorder: "#9be79b" },
  IN_QUEUE: { cardBg: "#fff7cc", border: "#f4de7b", badgeBg: "#fff7cc", badgeText: "#7a5d00", badgeBorder: "#f4de7b" },
  READY: { cardBg: "#e8dbff", border: "#c5a2ff", badgeBg: "#e8dbff", badgeText: "#4b1769", badgeBorder: "#c5a2ff" },
  PAYMENT_PENDING: { cardBg: "#ffe5d1", border: "#f8c39f", badgeBg: "#ffe5d1", badgeText: "#7a3b00", badgeBorder: "#f8c39f" },
  COMPLETED: { cardBg: "#d5f7f6", border: "#8cd3cf", badgeBg: "#d5f7f6", badgeText: "#0a6f6b", badgeBorder: "#8cd3cf" },
  DEFAULT: { cardBg: "#f1f1f1", border: "#cccccc", badgeBg: "#f1f1f1", badgeText: "#333333", badgeBorder: "#cccccc" },
};

/* ============================================================
   INLINE NOTIFICATION
============================================================ */
function InlineNotification({ message, type }: { message: string; type: NoteType }) {
  const colorClass =
    type === "start"
      ? "bg-orange-500 text-white"
      : type === "ready"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white";

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-sm font-semibold ${colorClass}`}>
      <span>🔔</span>
      <span>{message}</span>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [noteMessage, setNoteMessage] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("start");
  const [noteVisible, setNoteVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  /* ============================================================
     NOTIFICATION
  ============================================================ */
  function showNotification(message: string, type: NoteType) {
    setNoteMessage(message);
    setNoteType(type);
    setNoteVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      setNoteVisible(false);
    }, 3000);
  }

  /* ============================================================
     FETCH ORDERS (Correct API: /api/orders)
  ============================================================ */
  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data.orders)
          ? data.orders
          : [];

      setOrders(list);
    } catch {
      showNotification("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     SSE SETUP (Correct handling of SSE events)
  ============================================================ */
  useEffect(() => {
    fetchOrders();

    let es: EventSource | null = new EventSource("/api/orders/stream");

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);

        if (payload.type === "ORDERS") {
          setOrders(payload.orders || []);
          return;
        }

        if (payload.type === "NEW_ORDER") {
          setOrders((prev) => [payload.payload, ...prev]);
          showNotification("New order received!", "start");
          return;
        }

        if (payload.type === "ORDER_UPDATED") {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.payload.id ? payload.payload : o))
          );

          if (payload.payload.status === "READY") {
            showNotification("Order Ready!", "ready");
          }
          return;
        }
      } catch {}
    };

    es.onerror = () => es?.close();

    return () => es?.close();
  }, []);

  /* ============================================================
     FILTERS
  ============================================================ */
  const filteredOrders = (tab: string) =>
    tab === "ALL" ? orders : orders.filter((o) => o.status === tab);

  const counts = ALL_TABS.reduce(
    (acc, t) => ({
      ...acc,
      [t]: t === "ALL" ? orders.length : orders.filter((o) => o.status === t).length,
    }),
    {}
  );

  /* ============================================================
     DRAWER HANDLING
  ============================================================ */
  const openDrawer = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!drawerOpen || !drawerRef.current) return;
      if (!drawerRef.current.contains(e.target as Node)) closeDrawer();
    };

    addEventListener("mousedown", handler);
    return () => removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  /* ============================================================
     UPDATE STATUS
  ============================================================ */
  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!data.success) {
        showNotification("Failed to update", "error");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );

      if (newStatus === "IN_QUEUE") showNotification("Started Preparing", "start");
      if (newStatus === "READY") showNotification("Order Ready!", "ready");
    } catch {
      showNotification("Network error", "error");
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  /* ============================================================
     PAGE CONTENT
  ============================================================ */
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👨‍🍳 Kitchen Overview</h1>

        {noteVisible && <InlineNotification message={noteMessage} type={noteType} />}

        <div className="inline-flex bg-white p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={clsx(
              "p-2 rounded-md",
              viewMode === "grid" ? "bg-black text-white" : "bg-white text-gray-700"
            )}
          >
            <LayoutGrid size={16} />
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={clsx(
              "p-2 rounded-md",
              viewMode === "table" ? "bg-black text-white" : "bg-white text-gray-700"
            )}
          >
            <Table size={16} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6">
        <div className="bg-[rgba(255,243,230,0.95)] p-1 rounded-xl">
          <div className="flex gap-3 overflow-x-auto px-2">
            {ALL_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2",
                  activeTab === tab ? "bg-white shadow text-gray-900" : "text-gray-700"
                )}
              >
                {tab.replace("_", " ")}
                <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-white">
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" ? (
        filteredOrders(activeTab).length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No orders here.</div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders(activeTab).map((order) => {
              const colors = STATUS_COLORS[order.status] || STATUS_COLORS.DEFAULT;

              const itemsScrollable = order.items.length > 2;

              return (
                <Card
                  key={order.id}
                  onClick={() => openDrawer(order)}
                  className="cursor-pointer border-2 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col"
                  style={{ background: colors.cardBg, borderColor: colors.border }}
                >
                  <CardHeader className="bg-white rounded-t-2xl border-b pb-3">
                    <CardTitle className="flex justify-between items-center text-lg font-semibold">
                      {order.orderNumber}
                      <span
                        className="px-3 py-1 text-xs rounded-full font-bold uppercase"
                        style={{
                          background: colors.badgeBg,
                          color: colors.badgeText,
                          border: `1px solid ${colors.badgeBorder}`,
                        }}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </CardTitle>

                    <div className="text-sm text-gray-600 mt-1">
                      <p>👤 {order.customerName || "Guest"}</p>
                      <p>🍽️ Table: {order.tableNumber || "N/A"}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 flex-1 flex flex-col">
                    <div
                      className={clsx(
                        "mt-3 flex flex-col gap-3",
                        itemsScrollable && "max-h-44 overflow-y-auto pr-1"
                      )}
                    >
                      <ul className="space-y-3">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 border rounded-lg p-2 bg-white/80"
                          >
                            <img
                              src={item.imageUrl || FALLBACK_IMAGE}
                              className="w-14 h-14 rounded-md object-cover border"
                              alt={item.itemName}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₹{item.price ?? 0}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Total:</p>
                        <p className="text-lg font-semibold">₹{order.totalAmount}</p>
                      </div>

                      <div className="mt-3">
                        {order.status === "NEW" && (
                          <Button
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order.id, "IN_QUEUE");
                            }}
                          >
                            Start Preparing
                          </Button>
                        )}

                        {order.status === "IN_QUEUE" && (
                          <Button
                            className="w-full bg-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order.id, "READY");
                            }}
                          >
                            Order Ready
                          </Button>
                        )}

                        {order.status === "READY" && (
                          <div className="text-green-600 text-center font-semibold mt-1">
                            ✔ Ready to Serve
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-lg shadow border overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Table</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders(activeTab).map((order) => {
                const colors = STATUS_COLORS[order.status] || STATUS_COLORS.DEFAULT;

                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.customerName || "Guest"}</td>
                    <td className="px-4 py-3">{order.tableNumber || "N/A"}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 3).map((it) => (
                          <img
                            key={it.id}
                            src={it.imageUrl || FALLBACK_IMAGE}
                            className="w-8 h-8 rounded border object-cover"
                            alt={it.itemName}
                          />
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{order.items.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold">₹{order.totalAmount}</td>

                    <td className="px-4 py-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: colors.badgeBg,
                          color: colors.badgeText,
                          border: `1px solid ${colors.badgeBorder}`,
                        }}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      {order.status === "NEW" && (
                        <Button className="bg-orange-600" onClick={() => updateStatus(order.id, "IN_QUEUE")}>
                          Start
                        </Button>
                      )}

                      {order.status === "IN_QUEUE" && (
                        <Button className="bg-green-600" onClick={() => updateStatus(order.id, "READY")}>
                          Ready
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DRAWER */}
      <div
        className={clsx(
          "fixed inset-0 z-50 transition-opacity",
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />

        <aside
          ref={drawerRef}
          className={clsx(
            "absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-xl transform transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <button className="p-2" onClick={closeDrawer}>
              <X size={18} />
            </button>
          </div>

          {selectedOrder && (
            <div className="p-6 space-y-6 h-full flex flex-col">
              <div>
                <p className="text-sm text-gray-500">Order No.</p>
                <p className="text-lg font-bold">{selectedOrder.orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p>{selectedOrder.customerName || "Guest"}</p>
              </div>

              <div
                className={clsx(
                  "space-y-3 mt-2",
                  selectedOrder.items.length > 2 ? "flex-1 overflow-y-auto" : ""
                )}
              >
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <img
                      src={it.imageUrl || FALLBACK_IMAGE}
                      className="w-14 h-14 rounded border object-cover"
                      alt={it.itemName}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{it.itemName}</p>
                      <p className="text-xs text-gray-600">Qty: {it.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{it.price ?? 0}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">₹{selectedOrder.totalAmount}</p>
              </div>

              <div className="flex gap-3 pt-4">
                {selectedOrder.status === "NEW" && (
                  <Button className="flex-1" onClick={() => updateStatus(selectedOrder.id, "IN_QUEUE")}>
                    Start Preparing
                  </Button>
                )}

                {selectedOrder.status === "IN_QUEUE" && (
                  <Button className="flex-1 bg-green-600" onClick={() => updateStatus(selectedOrder.id, "READY")}>
                    Mark Ready
                  </Button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
