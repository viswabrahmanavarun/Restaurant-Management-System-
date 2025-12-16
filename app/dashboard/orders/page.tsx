"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus, X, LayoutGrid, Table } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  menuItemId?: string | null;   // ⭐ ADDED
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

const FALLBACK_IMAGE = "/mnt/data/45cd973e-ea3d-4462-9f30-e787e0012b06.png";

const TABS = [
  "ALL",
  "NEW",
  "PLACED",
  "IN_QUEUE",
  "READY",
  "PAYMENT_PENDING",
  "COMPLETED",
];

const statusStyles: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 border-blue-400",
  PLACED: "bg-green-100 text-green-700 border-green-400",
  IN_QUEUE: "bg-yellow-100 text-yellow-700 border-yellow-400",
  READY: "bg-purple-100 text-purple-700 border-purple-400",
  PAYMENT_PENDING: "bg-orange-100 text-orange-700 border-orange-400",
  COMPLETED: "bg-teal-100 text-teal-700 border-teal-400",
  CANCELLED: "bg-red-100 text-red-700 border-red-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
      else if (data?.orders && Array.isArray(data.orders)) setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();

    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/sse");
      es.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.type === "NEW_ORDER") {
            setOrders((prev) => [data.payload, ...prev]);
          } else if (data.type === "ORDER_UPDATED") {
            setOrders((prev) =>
              prev.map((o) => (o.id === data.payload.id ? data.payload : o))
            );
          }
        } catch {}
      };
      es.onerror = () => es?.close();
    } catch {}

    return () => es?.close();
  }, []);

  const counts = TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = t === "ALL" ? orders.length : orders.filter((o) => o.status === t).length;
    return acc;
  }, {} as Record<string, number>);

  const filteredOrders = (tab: string) =>
    tab === "ALL" ? orders : orders.filter((o) => o.status === tab);

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
    function handleOutside(e: MouseEvent) {
      if (!drawerOpen) return;
      if (!drawerRef.current) return;
      if (!drawerRef.current.contains(e.target as Node)) closeDrawer();
    }
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, [drawerOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-white">
        <Loader2 className="animate-spin text-orange-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-6 gap-4">

        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg shadow transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </Link>

        <div className="flex items-center gap-3">

          <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 p-1 shadow-sm">

            {/* GRID BUTTON */}
            <button
              aria-label="Grid"
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-md transition",
                viewMode === "grid"
                  ? "bg-orange-600 text-white"
                  : "text-gray-700 bg-gray-100"
              )}
            >
              <LayoutGrid size={16} />
            </button>

            {/* TABLE BUTTON */}
            <button
              aria-label="Table"
              onClick={() => setViewMode("table")}
              className={clsx(
                "p-2 rounded-md transition",
                viewMode === "table"
                  ? "bg-orange-600 text-white"
                  : "text-gray-700 bg-gray-100"
              )}
            >
              <Table size={16} />
            </button>

          </div>

          {/* CREATE ORDER BUTTON */}
          <Link href="/dashboard/orders/new">
            <button className="flex items-center gap-2 text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg shadow transition">
              <Plus className="w-4 h-4" /> Create Order
            </button>
          </Link>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-gray-900">Orders Overview</h1>

      {/* TABS */}
      <div className="mb-6">
        <div className="rounded-xl bg-gray-100 p-2">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition",
                  activeTab === tab
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700"
                )}
              >
                <span className="uppercase text-[12px]">{tab.replace("_", " ")}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200">
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
          <p className="text-center text-gray-500 mt-20 text-lg">No orders.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders(activeTab).map((order) => (
              <Card
                key={order.id}
                onClick={() => openDrawer(order)}
                className={clsx(
                  "cursor-pointer border rounded-2xl bg-white shadow-md hover:shadow-xl transition hover:scale-[1.01] h-[400px] flex flex-col",
                  statusStyles[order.status]
                )}
              >
                <CardHeader className="border-b pb-3 bg-white rounded-t-2xl">
                  <CardTitle className="text-lg font-semibold flex justify-between">
                    <span>{order.orderNumber}</span>
                    <span className={clsx(
                      "px-3 py-1 text-xs font-bold rounded-full",
                      statusStyles[order.status]
                    )}>
                      {order.status.replace("_", " ")}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    👤 {order.customerName ?? "Guest"}
                  </p>
                </CardHeader>

                {/* SCROLLABLE ITEMS */}
                <CardContent className="pt-4 flex-1 overflow-y-auto">
                  <ul className="space-y-3">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 border rounded-lg p-2 bg-gray-50">
                        <img
                          src={item.imageUrl || FALLBACK_IMAGE}
                          className="w-14 h-14 object-cover rounded-md border"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <div className="p-4 border-t flex justify-between">
                  <p>Total:</p>
                  <p className="font-semibold">₹{order.totalAmount}</p>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* TABLE VIEW */
        <div className="overflow-auto bg-white rounded-lg shadow border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Table</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredOrders(activeTab).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-4 text-sm">{order.customerName}</td>
                  <td className="px-4 py-4 text-sm">{order.tableNumber ?? "-"}</td>
                  <td className="px-4 py-4 text-sm flex gap-2">
                    {order.items.slice(0, 3).map((it) => (
                      <img key={it.id} src={it.imageUrl || FALLBACK_IMAGE} className="w-8 h-8 rounded border" />
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{order.items.length - 3}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold">₹{order.totalAmount}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      statusStyles[order.status]
                    )}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => openDrawer(order)}
                      className="px-3 py-1 rounded-md bg-orange-600 text-white text-sm hover:bg-orange-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DRAWER */}
      <div
        className={clsx(
          "fixed inset-0 z-50 transition-opacity",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />

        <aside
          ref={drawerRef}
          className={clsx(
            "absolute right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl transition-transform",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <button onClick={closeDrawer} className="p-2 rounded-md hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          {selectedOrder && (
            <div className="p-6 space-y-6 overflow-y-auto h-full">
              <p className="text-sm text-gray-600">Order No.</p>
              <p className="text-lg font-bold">{selectedOrder.orderNumber}</p>

              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{selectedOrder.customerName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={clsx(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  statusStyles[selectedOrder.status]
                )}>
                  {selectedOrder.status.replace("_", " ")}
                </span>
              </div>

              {/* ⭐ UPDATED ITEMS SECTION WITH REVIEW BUTTON */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>

                {selectedOrder.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 mb-3 border-b pb-3"
                  >
                    <img
                      src={it.imageUrl || FALLBACK_IMAGE}
                      className="w-14 h-14 rounded-md border"
                    />

                    <div className="flex-1">
                      <p className="font-medium">{it.itemName}</p>
                      <p className="text-xs">Qty: {it.quantity}</p>
                    </div>

                    <p className="font-semibold">₹{it.price}</p>

                    {/* ⭐ REVIEW BUTTON */}
                    {it.menuItemId && (
                      <Link
                        href={`/dashboard/reviews/add?menuItemId=${it.menuItemId}`}
                        className="text-xs bg-orange-600 text-white px-2 py-1 rounded-md hover:bg-orange-700"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">₹{selectedOrder.totalAmount}</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
