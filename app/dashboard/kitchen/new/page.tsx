"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  kotStatus: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber?: string | null;
  totalAmount?: number;
  status: string;
  items: OrderItem[];
};

const statusStyles: Record<string, string> = {
  NEW: "bg-blue-100 border-blue-300",
  IN_QUEUE: "bg-yellow-100 border-yellow-300",
  READY: "bg-purple-100 border-purple-300",
  PLACED: "bg-green-100 border-green-300",
  PAYMENT_PENDING: "bg-orange-100 border-orange-300",
  CANCELLED: "bg-red-100 border-red-300",
};

const statusBadge: Record<string, string> = {
  NEW: "bg-blue-200 text-blue-800",
  IN_QUEUE: "bg-yellow-200 text-yellow-800",
  READY: "bg-purple-200 text-purple-800",
  PLACED: "bg-green-200 text-green-800",
  PAYMENT_PENDING: "bg-orange-200 text-orange-800",
  CANCELLED: "bg-red-200 text-red-800",
};

export default function KitchenAddPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);

  // FORM FIELDS
  const [selectedOrder, setSelectedOrder] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  // SSE Live Stream
  useEffect(() => {
    const es = new EventSource("/api/orders/stream");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "ORDERS") {
          setOrders(data.orders || []);
        }

        if (data.type === "NEW_ORDER") {
          setOrders((prev) => [data.payload, ...prev]);
        }

        if (data.type === "ORDER_UPDATED") {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === data.payload.id ? data.payload : o
            )
          );
        }
      } catch (err) {
        console.error("SSE Error", err);
      }
    };

    return () => es.close();
  }, []);

  // SUBMIT NEW KOT ITEM
  async function handleSubmit() {
    if (!selectedOrder || !itemName || !qty || !price) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/kot/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder,
          itemName,
          quantity: qty,
          price,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to create KOT item");
        return;
      }

      alert("KOT Added Successfully!");
      setShowModal(false);

      // clear fields
      setItemName("");
      setQty(1);
      setPrice(0);
      setSelectedOrder("");

    } catch (err) {
      console.error(err);
      alert("Error adding KOT");
    }
  }

  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kitchen Orders</h1>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          ➕ Add KOT
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => {
          const hasScroll = order.items.length > 2;

          return (
            <div
              key={order.id}
              className={`border-2 rounded-2xl shadow-md p-4 flex flex-col ${
                statusStyles[order.status] || "bg-gray-100 border-gray-300"
              }`}
            >
              {/* HEADER */}
              <div className="mb-3 flex justify-between items-center">
                <h2 className="font-bold text-lg">{order.orderNumber}</h2>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${statusBadge[order.status]}`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>

              {/* CUSTOMER */}
              <div className="mb-3 text-sm text-gray-700 space-y-1">
                <p>👤 {order.customerName}</p>
                <p>🍽️ Table: {order.tableNumber || "-"}</p>
              </div>

              {/* ITEMS */}
              <div
                className={`flex flex-col gap-3 ${
                  hasScroll ? "max-h-40 overflow-y-auto pr-2" : ""
                }`}
              >
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/70 border rounded-lg p-3 shadow-sm"
                  >
                    <p className="font-medium text-gray-900">{item.itemName}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-auto border-t pt-3 text-right">
                <p className="font-bold text-gray-900 text-lg">
                  ₹{Number(order.totalAmount ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== MODAL ======================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Add KOT Item</h2>

            {/* ORDER SELECT */}
            <label className="block mb-2 font-medium">Order</label>
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
            >
              <option value="">Select Order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.customerName}
                </option>
              ))}
            </select>

            {/* ITEM NAME */}
            <label className="block mb-2 font-medium">Item Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />

            {/* QUANTITY */}
            <label className="block mb-2 font-medium">Quantity</label>
            <input
              type="number"
              className="w-full p-2 border rounded mb-4"
              value={qty}
              min={1}
              onChange={(e) => setQty(Number(e.target.value))}
            />

            {/* PRICE */}
            <label className="block mb-2 font-medium">Price</label>
            <input
              type="number"
              className="w-full p-2 border rounded mb-4"
              value={price}
              min={1}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSubmit}
              >
                Save KOT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
