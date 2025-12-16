"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/** -------------------------
 * Types
 * ------------------------- */
type OrderItem = {
  itemName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  tax?: number;
  discount?: number;
  serviceCharge?: number;
  createdAt: string;
  items: OrderItem[];
  // invoices may be present but GET /api/orders already injects tax/discount/serviceCharge
};

type ItemSummary = {
  itemName: string;
  quantity: number;
  revenue: number;
};

type Period = "daily" | "weekly" | "monthly";

/** -------------------------
 * Helpers: dates & grouping
 * ------------------------- */

function toYYYYMMDD(date: Date) {
  return date.toISOString().slice(0, 10);
}

// ISO week number helper (returns year-week as string e.g. "2025-W47")
function getISOWeekKey(date: Date) {
  // copy date so don't mutate
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
}

/** -------------------------
 * Component
 * ------------------------- */

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [period, setPeriod] = useState<Period>("daily");

  // date state for daily (and reference date for weekly/monthly)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // For weekly/monthly we also allow moving the period (prev/next)
  const [weekRef, setWeekRef] = useState(() => getISOWeekKey(new Date()));
  const [monthRef, setMonthRef] = useState(() => getMonthKey(new Date()));

  const chartRef = useRef<HTMLDivElement | null>(null);

  // aggregated state derived
  const [itemSummary, setItemSummary] = useState<ItemSummary[]>([]);
  const [totals, setTotals] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalTax: 0,
    totalDiscount: 0,
    totalServiceCharge: 0,
  });

  // Fetch all orders once (client-side). The GET endpoint returns invoice data included.
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        const allOrders: Order[] = data.orders ?? [];

        // Normalize numeric fields to numbers (safety)
        const normalized = allOrders.map((o) => ({
          ...o,
          tax: Number(o.tax ?? 0),
          discount: Number(o.discount ?? 0),
          serviceCharge: Number(o.serviceCharge ?? 0),
          totalAmount: Number(o.totalAmount ?? 0),
        }));

        setOrders(normalized);
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Failed to fetch orders" });
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  // When inputs change (orders / selected period / date refs), recompute aggregates
  useEffect(() => {
    // choose filter function by period
    const filtered = orders.filter((order) => {
      const created = new Date(order.createdAt);
      if (!(created instanceof Date) || isNaN(created.getTime())) return false;

      if (period === "daily") {
        return toYYYYMMDD(created) === selectedDate;
      }

      if (period === "weekly") {
        return getISOWeekKey(created) === weekRef;
      }

      // monthly
      if (period === "monthly") {
        return getMonthKey(created) === monthRef;
      }

      return false;
    });

    // Build item summary map and totals
    const summaryMap: Record<string, ItemSummary> = {};
    let totalRevenue = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalServiceCharge = 0;

    filtered.forEach((order) => {
      // If invoice fields available, prefer them, otherwise compute from items
      const orderRevenueFromItems = order.items.reduce((s, it) => s + it.quantity * it.price, 0);
      totalRevenue += orderRevenueFromItems;
      totalTax += order.tax ?? 0;
      totalDiscount += order.discount ?? 0;
      totalServiceCharge += order.serviceCharge ?? 0;

      order.items.forEach((item) => {
        const rev = item.quantity * item.price;
        if (!summaryMap[item.itemName]) summaryMap[item.itemName] = { itemName: item.itemName, quantity: 0, revenue: 0 };
        summaryMap[item.itemName].quantity += item.quantity;
        summaryMap[item.itemName].revenue += rev;
      });
    });

    setTotals({
      totalOrders: filtered.length,
      totalRevenue,
      totalTax,
      totalDiscount,
      totalServiceCharge,
    });

    setItemSummary(Object.values(summaryMap));
  }, [orders, period, selectedDate, weekRef, monthRef]);

  // Helpers to shift week/month
  function shiftWeek(delta: number) {
    // parse current weekRef: YYYY-Www
    const [y, wPart] = weekRef.split("-W");
    let year = Number(y);
    let week = Number(wPart);
    week += delta;
    // approximate: convert to date and back until correct
    // find january 1st then add (week-1)*7 days and get ISO week
    const tentative = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const newKey = getISOWeekKey(tentative);
    setWeekRef(newKey);
  }

  function shiftMonth(delta: number) {
    const [yStr, mStr] = monthRef.split("-");
    const y = Number(yStr);
    const m = Number(mStr) - 1;
    const d = new Date(y, m + delta, 1);
    setMonthRef(getMonthKey(d));
  }

  // PDF export for current period
  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginLeft = 40;
    const marginTop = 40;
    const title =
      period === "daily"
        ? `Daily Usage Report - ${selectedDate}`
        : period === "weekly"
        ? `Weekly Usage Report - ${weekRef}`
        : `Monthly Usage Report - ${monthRef}`;

    doc.setFontSize(16);
    doc.text(title, marginLeft, marginTop);

    const summaryHead = ["Total Orders", "Total Revenue", "Total Tax", "Total Discount", "Total Service Charge"];
    autoTable(doc, {
      startY: marginTop + 20,
      head: [summaryHead],
      body: [
        [
          totals.totalOrders.toString(),
          `₹${totals.totalRevenue.toFixed(2)}`,
          `₹${totals.totalTax.toFixed(2)}`,
          `₹${totals.totalDiscount.toFixed(2)}`,
          `₹${totals.totalServiceCharge.toFixed(2)}`,
        ],
      ],
      styles: { fontSize: 11 },
    });

    const yAfterSummary = (doc as any).lastAutoTable.finalY + 16;

    autoTable(doc, {
      startY: yAfterSummary,
      head: [["Item", "Quantity Sold", "Revenue"]],
      body: itemSummary.map((it) => [it.itemName, it.quantity.toString(), `₹${it.revenue.toFixed(2)}`]),
      styles: { fontSize: 10 },
    });

    const yAfterTable = (doc as any).lastAutoTable.finalY + 16;

    // capture charts container
    const canvas = await html2canvas(chartRef.current!, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = (doc as any).getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth() - marginLeft * 2;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    doc.addImage(imgData, "PNG", marginLeft, yAfterTable, pdfWidth, pdfHeight);

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  };

  // Prepare chart data
  const barData = useMemo(
    () => ({
      labels: itemSummary.map((i) => i.itemName),
      datasets: [
        {
          label: "Quantity Sold",
          data: itemSummary.map((i) => i.quantity),
          backgroundColor: "rgba(34,197,94,0.7)",
        },
      ],
    }),
    [itemSummary]
  );

  const pieData = useMemo(
    () => ({
      labels: itemSummary.map((i) => i.itemName),
      datasets: [
        {
          label: "Revenue",
          data: itemSummary.map((i) => i.revenue),
          backgroundColor: itemSummary.map((_, idx) => `hsl(${(idx * 40) % 360}, 70%, 50%)`),
        },
      ],
    }),
    [itemSummary]
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  // UI: Tabs + controls
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Usage Reports</h1>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <div className="flex bg-white rounded shadow">
          <button
            onClick={() => setPeriod("daily")}
            className={`px-4 py-2 rounded-l ${period === "daily" ? "bg-orange-500 text-white" : "text-gray-700"}`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-2 ${period === "weekly" ? "bg-orange-500 text-white" : "text-gray-700"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-2 rounded-r ${period === "monthly" ? "bg-orange-500 text-white" : "text-gray-700"}`}
          >
            Monthly
          </button>
        </div>

        {/* Controls for selected period */}
        {period === "daily" && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        )}

        {period === "weekly" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftWeek(-1)}
              className="px-2 py-1 border rounded text-sm"
              title="Previous week"
            >
              ◀
            </button>
            <div className="px-3 py-1 border rounded bg-white text-sm">{weekRef}</div>
            <button onClick={() => shiftWeek(1)} className="px-2 py-1 border rounded text-sm" title="Next week">
              ▶
            </button>
          </div>
        )}

        {period === "monthly" && (
          <div className="flex items-center gap-2">
            <button onClick={() => shiftMonth(-1)} className="px-2 py-1 border rounded text-sm" title="Previous month">
              ◀
            </button>
            <div className="px-3 py-1 border rounded bg-white text-sm">{monthRef}</div>
            <button onClick={() => shiftMonth(1)} className="px-2 py-1 border rounded text-sm" title="Next month">
              ▶
            </button>
          </div>
        )}

        <div className="ml-auto">
          <Button onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Summary card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <b>Total Orders:</b> {totals.totalOrders}
          </p>
          <p>
            <b>Total Revenue:</b> ₹{totals.totalRevenue.toFixed(2)}
          </p>
          <p>
            <b>Total Tax:</b> ₹{totals.totalTax.toFixed(2)}
          </p>
          <p>
            <b>Total Discount:</b> ₹{totals.totalDiscount.toFixed(2)}
          </p>
          <p>
            <b>Total Service Charge:</b> ₹{totals.totalServiceCharge.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Item breakdown */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Item-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1 text-left">Item</th>
                <th className="border px-2 py-1 text-right">Quantity</th>
                <th className="border px-2 py-1 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {itemSummary.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    No data for selected period
                  </td>
                </tr>
              ) : (
                itemSummary.map((it) => (
                  <tr key={it.itemName}>
                    <td className="border px-2 py-1">{it.itemName}</td>
                    <td className="border px-2 py-1 text-right">{it.quantity}</td>
                    <td className="border px-2 py-1 text-right">₹{it.revenue.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div ref={chartRef} className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md p-4">
          <CardTitle className="mb-2 text-sm font-semibold">Quantity Sold (Bar)</CardTitle>
          <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
        </Card>

        <Card className="shadow-md p-4">
          <CardTitle className="mb-2 text-sm font-semibold">Revenue Share (Pie)</CardTitle>
          <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
        </Card>
      </div>
    </div>
  );
}
