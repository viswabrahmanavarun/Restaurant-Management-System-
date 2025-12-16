"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const [queueCount, setQueueCount] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ⭐ NEW: State for the role
  const [userRole, setUserRole] = useState<string | null>(null);

  // ⭐ Load role AFTER mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  const isAdmin = userRole?.toLowerCase() === "admin";

  // Fetch counts
  async function fetchCounts() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (data.success) {
        const inQueue = data.orders.filter(
          (order: any) => order.status === "IN_QUEUE"
        ).length;

        const ready = data.orders.filter(
          (order: any) => order.status === "READY"
        ).length;

        setQueueCount(inQueue);
        setReadyCount(ready);
      }
    } catch (error) {
      console.error("❌ Error fetching order counts:", error);
    } finally {
      setLoading(false);
    }
  }

  // SSE updates
  useEffect(() => {
    fetchCounts();

    const eventSource = new EventSource("/api/sse");
    eventSource.onmessage = () => fetchCounts();

    return () => eventSource.close();
  }, []);

  const linkClasses = (path: string) =>
    `flex justify-between items-center px-4 py-2 rounded-lg transition-colors ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-800 hover:bg-gray-100"
    }`;

  if (loading || userRole === null) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-4 border-r border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        🍴 Kitchen Panel
      </h2>

      <nav className="space-y-2">
        <Link href="/dashboard" className={linkClasses("/dashboard")}>
          <span>🏠 Dashboard</span>
        </Link>

        <Link href="/kitchen" className={linkClasses("/kitchen")}>
          <span>👨‍🍳 All Orders</span>
        </Link>

        <Link href="/kitchen/queue" className={linkClasses("/kitchen/queue")}>
          <span>🟡 In Queue</span>
          <span className="bg-yellow-400 text-white px-2 py-0.5 rounded-full text-sm font-semibold">
            {queueCount}
          </span>
        </Link>

        <Link href="/kitchen/ready" className={linkClasses("/kitchen/ready")}>
          <span>🟢 Ready Orders</span>
          <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-sm font-semibold">
            {readyCount}
          </span>
        </Link>
      </nav>

      {/* ⭐ SETTINGS — Admin Only AFTER role is loaded */}
      {isAdmin && (
        <div className="mt-10">
          <h3 className="text-sm text-gray-600 mb-2">QUICK ACCESS</h3>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200"
          >
            <span>⚙️ Settings</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
