"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  User,
  MapPin,
  Utensils,
  ChevronLeft,
  X,
  LayoutGrid,
  Table,
  Moon,
  Sun,
  TrendingUp,
  DollarSign,
  Users,
  Coffee,
  CheckCircle,
  Clock,
} from "lucide-react";

import clsx from "clsx";

/* Charts */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

/* PAGE BACKGROUND */
const PAGE_BG = "#FFFFFF";

/* STATUS COLORS */
const STATUS_COLORS: Record<string, { card: string; badge: string }> = {
  PLACED: {
    card: "border-[#C6F6D5] bg-[#E8FFF1]",
    badge: "bg-[#D4FDE1] text-green-700 border border-[#8FE4A8]",
  },
  IN_QUEUE: {
    card: "border-[#FEEBC8] bg-[#FFF9E6]",
    badge: "bg-[#FFF1CC] text-yellow-700 border border-[#F6C768]",
  },
  PAYMENT_PENDING: {
    card: "border-[#FEC6A1] bg-[#FFF0E6]",
    badge:
      "bg-[#FFE0CC] text-orange-700 border border-[#FF995E] strong-pulse",
  },
  READY: {
    card: "border-[#E9D8FD] bg-[#F9F2FF]",
    badge: "bg-[#F0E3FF] text-purple-700 border border-[#CBB5FF]",
  },
  COMPLETED: {
    card: "border-[#BEE3F8] bg-[#E6F6FF]",
    badge: "bg-[#D2EDFF] text-blue-700 border border-[#90CDF4]",
  },
  NEW: {
    card: "border-blue-300 bg-blue-100",
    badge: "bg-blue-200 text-blue-800 border border-blue-300",
  },
  DEFAULT: {
    card: "border-gray-300 bg-gray-100",
    badge: "bg-gray-200 text-gray-700 border border-gray-300",
  },
};

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
  customerName?: string | null;
  tableNumber?: string | null;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string; // ISO date string from DB
};

/* Utilities */
const fmt = (n?: number) => `₹${(n ?? 0).toFixed(0)}`;

/* helper: build last N days array (ending today) */
function buildLastNDays(n = 7) {
  const days: { date: Date; label: string; iso: string }[] = [];
  const today = new Date();
  // create array from (n-1) days ago up to today
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue...
    const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
    days.push({ date: d, label, iso });
  }
  return days;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<
    { id: string; name: string; category: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const drawerRef = useRef<HTMLDivElement | null>(null);

  /* SOUND ALERT */
  const newOrderAudio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    newOrderAudio.current = new Audio("/notification.mp3");
  }, []);

  /* Fetch orders and menuItems on mount */
  useEffect(() => {
    let mounted = true;

    async function fetchEverything() {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/menuItem"),
        ]);

        const ordersJson = await ordersRes.json();
        const menuJson = await menuRes.json();

        const realOrders: Order[] = Array.isArray(ordersJson)
          ? ordersJson
          : ordersJson?.orders ?? [];

        // normalize createdAt to ISO strings if Date objects exist
        const normalized: Order[] = realOrders.map((o: any) => ({
          ...o,
          createdAt:
            typeof o.createdAt === "string"
              ? o.createdAt
              : o.createdAt?.toISOString?.() ?? new Date().toISOString(),
        }));

        if (!mounted) return;

        setOrders(normalized);
        // menuJson may be array directly
        const menuArray = Array.isArray(menuJson) ? menuJson : menuJson?.data ?? [];
        setMenuItems(
          menuArray.map((m: any) => ({ id: m.id ?? m._id ?? m.name, name: m.name, category: m.category ?? "Uncategorized" }))
        );
      } catch (e) {
        console.error("Failed to fetch orders/menuItems:", e);
      }
    }

    fetchEverything();

    return () => {
      mounted = false;
    };
  }, []);

  /* SSE Updates + Sound Alerts (reuse your stream) */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const es = new EventSource("/api/orders/stream");

      es.onmessage = (e) => {
        try {
          if (!e.data || e.data === '"connected"') return;

          const payload = JSON.parse(e.data);

          if (payload?.type === "NEW_ORDER") {
            newOrderAudio.current?.play().catch(() => {});
            setOrders((prev) => [payload.payload, ...prev]);
            return;
          }

          if (payload?.type === "ORDER_UPDATED") {
            const o = payload.payload;
            setOrders((prev) => prev.map((p) => (p.id === o.id ? o : p)));
            return;
          }

          if (payload?.order) {
            const o = payload.order;
            setOrders((prev) =>
              prev.some((p) => p.id === o.id) ? prev.map((p) => (p.id === o.id ? o : p)) : [o, ...prev]
            );
          }
        } catch {}
      };

      es.onerror = () => es.close();
      return () => es.close();
    } catch {
      // no stream available - ignore
    }
  }, []);

  const statuses = ["ALL", "NEW", "PLACED", "IN_QUEUE", "READY", "PAYMENT_PENDING", "COMPLETED"];

  const counts = statuses.reduce<Record<string, number>>((acc, s) => {
    acc[s] = s === "ALL" ? orders.length : orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const filteredOrders = (tab: string) => (tab === "ALL" ? orders : orders.filter((o) => o.status === tab));

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

  /* Close drawer on outside click */
  useEffect(() => {
    function close(e: MouseEvent) {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    }
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [drawerOpen]);

  /* Derived metrics */
  const totalOrders = orders.length;
  const totalRevenueFromOrders = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const totalCustomers = new Set(orders.map((o) => o.customerName || "Guest")).size;

  /* Kitchen Summary (Detailed) */
  const kitchenActiveStatuses = new Set(["NEW", "PLACED", "IN_QUEUE", "READY"]);
  const activeKitchenOrders = orders.filter((o) => kitchenActiveStatuses.has(o.status));
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const pendingItems = activeKitchenOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + (it.quantity ?? 0), 0), 0);

  /* Build last 7 days labels and buckets */
  const last7Days = useMemo(() => buildLastNDays(7), []);

  /* Revenue chart data (last 7 days) */
  const revenueChartData = useMemo(() => {
    // initialize buckets
    const buckets = last7Days.map((d) => ({ day: d.label, iso: d.iso, revenue: 0, orders: 0 }));
    const mapIdx: Record<string, number> = {};
    buckets.forEach((b, i) => (mapIdx[b.iso] = i));

    // aggregate orders into buckets by date (YYYY-MM-DD)
    orders.forEach((o) => {
      try {
        const isoDate = (o.createdAt || "").slice(0, 10);
        if (mapIdx[isoDate] !== undefined) {
          const idx = mapIdx[isoDate];
          buckets[idx].revenue += Number(o.totalAmount ?? 0);
          buckets[idx].orders += 1;
        }
      } catch (e) {}
    });

    // prepare final array for charts
    return buckets.map((b) => ({ day: b.day, revenue: Math.round(b.revenue), orders: b.orders }));
  }, [orders, last7Days]);

  /* orders bar data - simplified mapping */
  const ordersBarData = revenueChartData.map((d) => ({ day: d.day, orders: d.orders }));

  /* Category breakdown by summing quantities (map itemName -> menuItem.category) */
  const categoryData = useMemo(() => {
    if (!menuItems.length) {
      return [];
    }

    const nameToCategory = new Map<string, string>();
    menuItems.forEach((m) => {
      if (m.name) nameToCategory.set(m.name.trim().toLowerCase(), m.category ?? "Uncategorized");
    });

    const counts: Record<string, number> = {};

    orders.forEach((o) => {
      o.items.forEach((it) => {
        const key = (it.itemName || "").trim().toLowerCase();
        const category = nameToCategory.get(key) ?? "Uncategorized";
        const qty = Math.max(1, Number(it.quantity ?? 1));
        counts[category] = (counts[category] || 0) + qty;
      });
    });

    // convert to array sorted by value desc
    const arr = Object.entries(counts).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    // if nothing, return empty
    return arr;
  }, [orders, menuItems]);

  return (
    <div className={clsx("min-h-screen p-8", darkMode && "dark")} style={{ background: PAGE_BG }}>
      <div className="max-w-full mx-auto dark:bg-gray-900 dark:text-white">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Restaurant Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Live overview — charts & orders.</p>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg border bg-gray-100 dark:bg-gray-800">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Back */}
            <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-orange-500 hover:bg-orange-600">
              <ChevronLeft size={18} /> Back
            </button>
          </div>
        </div>

        {/* TOP GRID: Summary (4 cards) full width */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Orders - Light Red */}
          <div className="rounded-lg p-4" style={{ background: "#FFF5F5", border: "1px solid #FEE2E2" }}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-red-600 font-semibold">Total Orders</div>
              <div className="p-2 rounded-md bg-white/60">
                <TrendingUp size={18} className="text-red-600" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold text-red-700">{totalOrders}</div>
              <div className="text-sm text-gray-600 mt-1">Orders (last 7 days view)</div>
            </div>
          </div>

          {/* Total Revenue - Light Green */}
          <div className="rounded-lg p-4" style={{ background: "#F0FFF4", border: "1px solid #DFF6E7" }}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-green-700 font-semibold">Total Revenue</div>
              <div className="p-2 rounded-md bg-white/60">
                <DollarSign size={18} className="text-green-700" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold text-green-800">{fmt(totalRevenueFromOrders)}</div>
              <div className="text-sm text-gray-600 mt-1">Revenue (from orders)</div>
            </div>
          </div>

          {/* Customers - Light Yellow */}
          <div className="rounded-lg p-4" style={{ background: "#FFFAE5", border: "1px solid #FEF3C7" }}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-yellow-700 font-semibold">Customers</div>
              <div className="p-2 rounded-md bg-white/60">
                <Users size={18} className="text-yellow-700" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-bold text-yellow-800">{totalCustomers}</div>
              <div className="text-sm text-gray-600 mt-1">Active customers</div>
            </div>
          </div>

          {/* Kitchen Summary - Light Blue */}
          <div className="rounded-lg p-4" style={{ background: "#EDF6FF", border: "1px solid #DBEEF9" }}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-blue-700 font-semibold">Kitchen Summary</div>
              <div className="p-2 rounded-md bg-white/60">
                <Coffee size={18} className="text-blue-700" />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={14} />
                  <div>Active Orders</div>
                </div>
                <div className="font-semibold">{activeKitchenOrders.length}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-yellow-700" size={14} />
                  <div>Completed Orders</div>
                </div>
                <div className="font-semibold">{completedOrders.length}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="text-orange-500" size={14} />
                  <div>Pending Items</div>
                </div>
                <div className="font-semibold">{pendingItems}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CHARTS UNDER SUMMARY ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* REVENUE CHART */}
          <Card className="p-4">
            <CardHeader className="p-0 flex items-center justify-between">
              <CardTitle className="text-base">Revenue (Last 7 days)</CardTitle>
              <div className="text-sm text-gray-500">Orders & Revenue</div>
            </CardHeader>

            <CardContent className="p-0 mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => (typeof value === "number" ? fmt(value) : value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#FF7A18" strokeWidth={3} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ORDERS OVERVIEW */}
          <Card className="p-4">
            <CardHeader className="p-0 flex items-center justify-between">
              <CardTitle className="text-base">Orders Overview</CardTitle>
              <div className="text-sm text-gray-500">This week</div>
            </CardHeader>

            <CardContent className="p-0 mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersBarData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" barSize={22}>
                    {ordersBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === ordersBarData.length - 1 ? "#FF7A18" : "#FDBA74"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* TOP CATEGORIES */}
          <Card className="p-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base">Top Categories</CardTitle>
            </CardHeader>

            <CardContent className="p-0 mt-4 h-56 flex items-center justify-center">
              {categoryData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={categoryData} cx="50%" cy="50%" outerRadius={70} label>
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-cat-${index}`}
                          fill={["#F59E0B", "#FCD34D", "#EF4444", "#10B981", "#A78BFA", "#60A5FA", "#F97316"][index % 7]}
                        />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={24} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-gray-500">No category data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ORDERS SECTION (your existing UI below the top dashboard) */}
        <div className="mt-6">
          {/* VIEW MODE SWITCH */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setViewMode("cards")}
              className={clsx(
                "px-4 py-2 rounded-md flex items-center gap-2 border",
                viewMode === "cards" ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 dark:text-gray-200"
              )}
            >
              <LayoutGrid size={18} /> Cards
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={clsx(
                "px-4 py-2 rounded-md flex items-center gap-2 border",
                viewMode === "table" ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 dark:text-gray-200"
              )}
            >
              <Table size={18} /> Table
            </button>
          </div>

          {/* TABS */}
          <Tabs value={activeTab}>
            <TabsList className="flex gap-3 overflow-x-auto bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm">
              {statuses.map((s) => (
                <TabsTrigger
                  key={s}
                  value={s}
                  onClick={() => setActiveTab(s)}
                  className={clsx(
                    "px-4 py-2 rounded-lg font-semibold uppercase text-sm transition",
                    activeTab === s ? "bg-orange-500 text-white shadow-md" : "text-gray-700 hover:text-orange-600 dark:text-gray-300"
                  )}
                >
                  {s.replace("_", " ")} ({counts[s]})
                </TabsTrigger>
              ))}
            </TabsList>

            {/* CARD VIEW */}
            {viewMode === "cards" && (
              <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders(activeTab).map((order, idx) => {
                  const style = STATUS_COLORS[order.status] || STATUS_COLORS.DEFAULT;

                  return (
                    <Card
                      key={order.id}
                      onClick={() => openDrawer(order)}
                      className={clsx(
                        "cursor-pointer border-2 rounded-2xl shadow-sm hover:shadow-xl transition transform hover:-translate-y-2 hover:scale-[1.01] duration-350 animate-fadeInGlass flex flex-col dark:bg-gray-800 dark:border-gray-700",
                        style.card
                      )}
                      style={{ animationDelay: `${Math.min(idx * 60, 600)}ms`, background: "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))" }}
                    >
                      <CardHeader className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
                        <CardTitle className="text-xl font-semibold dark:text-white">{order.orderNumber}</CardTitle>

                        <Badge
                          className={clsx("px-3 py-1 rounded-full text-xs", style.badge, order.status === "PAYMENT_PENDING" && "strong-pulse")}
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                      </CardHeader>

                      <CardContent className="pt-3 space-y-3 text-gray-700 dark:text-gray-300 flex-1 flex flex-col">
                        <div className="flex gap-2 items-center text-sm">
                          <User size={14} className="text-gray-500 dark:text-gray-400" />
                          <span>
                            Customer:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">{order.customerName || "Guest"}</span>
                          </span>
                        </div>

                        <div className="flex gap-2 items-center text-sm">
                          <MapPin size={14} className="text-gray-500 dark:text-gray-400" />
                          <span>
                            Table:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">{order.tableNumber || "-"}</span>
                          </span>
                        </div>

                        {/* ITEMS BOX (Scrollable) */}
                        <div className="flex flex-col rounded-xl border bg-white/80 dark:bg-gray-700 shadow-sm h-[200px] dark:border-gray-600 overflow-hidden">
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-t-xl">
                            <Utensils size={14} />
                            <span className="font-semibold">Items</span>
                          </div>

                          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scroll">
                            {order.items.map((it) => {
                              return (
                                <div key={it.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition dark:bg-gray-600 dark:hover:bg-gray-500">
                                  <div className="flex items-center gap-3">
                                    {it.imageUrl ? (
                                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                                        <Image src={it.imageUrl} alt={it.itemName} fill style={{ objectFit: "cover" }} />
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                                        {it.itemName.split(" ").slice(0,2).map(x=>x[0]).join("")}
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <p className="font-medium dark:text-white truncate">{it.itemName}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-300">Qty: {it.quantity}</p>
                                    </div>
                                  </div>

                                  <p className="font-medium dark:text-white ml-3">{fmt(it.price)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-base font-semibold mt-2 border-t pt-2 dark:border-gray-700 dark:text-white">
                          <span>Total Amount:</span>
                          <span>{fmt(order.totalAmount)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* TABLE VIEW */}
            {viewMode === "table" && (
              <div className="mt-6 overflow-x-auto rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-3 text-left">Order</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-left">Table</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders(activeTab).map((order) => {
                      const style = STATUS_COLORS[order.status] || STATUS_COLORS.DEFAULT;

                      return (
                        <tr
                          key={order.id}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => openDrawer(order)}
                        >
                          <td className="p-3 font-semibold">{order.orderNumber}</td>
                          <td className="p-3">{order.customerName || "Guest"}</td>
                          <td className="p-3">{order.tableNumber || "-"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${style.badge}`}>{order.status.replace("_", " ")}</span>
                          </td>
                          <td className="p-3 font-bold">{fmt(order.totalAmount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Tabs>
        </div>
      </div>

      {/* DRAWER */}
      <div className={clsx("fixed inset-0 z-50", drawerOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          className={clsx("absolute inset-0 bg-black/40 transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={closeDrawer}
        />

        <aside
          ref={drawerRef}
          className={clsx(
            "absolute right-0 top-0 bg-white dark:bg-gray-800 h-full w-full sm:w-[440px] shadow-2xl transition-transform",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white">Order Details</h2>
            <button onClick={closeDrawer}>
              <X size={18} className="dark:text-gray-300" />
            </button>
          </div>

          {selectedOrder ? (
            <div className="p-5 space-y-6 overflow-y-auto h-full custom-scroll">
              <div className="flex justify-between dark:text-white">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">Customer</div>
                  <div className="font-semibold">{selectedOrder.customerName}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">Table</div>
                  <div className="font-semibold">{selectedOrder.tableNumber}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 dark:text-white">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((it) => {
                    return (
                      <div key={it.id} className="flex justify-between border-b pb-2 dark:border-gray-700 items-center">
                        <div className="flex items-center gap-3">
                          {it.imageUrl ? (
                            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                              <Image src={it.imageUrl} alt={it.itemName} fill style={{ objectFit: "cover" }} />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                              {it.itemName.split(" ").slice(0,2).map(x=>x[0]).join("")}
                            </div>
                          )}

                          <div>
                            <p className="font-medium dark:text-white">{it.itemName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {it.quantity}</p>
                          </div>
                        </div>

                        <p className="font-semibold dark:text-white">{fmt(it.price)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-3 dark:border-gray-700">
                <div className="flex justify-between dark:text-white">
                  <span>Total:</span>
                  <span className="font-semibold">{fmt(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>
          )}
        </aside>
      </div>

      {/* Animations + Scrollbars */}
      <style jsx>{`
        @keyframes strongPulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 120, 10, 0.3); }
          50% { box-shadow: 0 0 0 10px rgba(255, 120, 10, 0.05); }
          100% { box-shadow: 0 0 0 0 rgba(255, 120, 10, 0); }
        }
        .strong-pulse {
          animation: strongPulse 1.6s infinite ease-in-out;
        }

        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c7c7c7;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #aaaaaa;
        }

        /* small fadeIn animation for cards + glassy shimmer */
        .animate-fadeInGlass {
          animation: fadeInGlass 420ms ease both;
        }
        @keyframes fadeInGlass {
          from { opacity: 0; transform: translateY(8px) scale(0.997); filter: blur(2px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        /* soft diagonal sheen on hover */
        .rounded-2xl:hover::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0));
          border-radius: 1rem;
          mix-blend-mode: overlay;
          animation: sheen 900ms ease-out;
        }
        @keyframes sheen {
          from { transform: translateX(-40%); opacity: 0; }
          to { transform: translateX(40%); opacity: 1; }
        }

        /* small fadeIn for drawer */
        .drawerEnter {
          transition: transform 320ms cubic-bezier(.2,.9,.3,1), opacity 200ms;
        }

        /* tiny card entrance staggering using inline animation-delay in style attr */

      `}</style>
    </div>
  );
}
