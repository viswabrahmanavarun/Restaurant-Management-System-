"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Receipt, PlusCircle, CreditCard, Wallet, Smartphone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber?: string;
  status: string;
  items: OrderItem[];
};

type NewInvoice = {
  customerName: string;
  items: { itemName: string; quantity: number; price: number }[];
  paymentMode: string;
};

export default function CreateInvoicePage() {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    customerName: "",
    items: [{ itemName: "", quantity: 1, price: 0 }],
    paymentMode: "cash",
  });

  // 🔹 Fetch completed orders
  const fetchCompletedOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const completed = data.filter((order: Order) => order.status === "COMPLETED");
      setCompletedOrders(completed);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch completed orders.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  // 🔹 Handle field updates
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...newInvoice.items];
    (updated[index] as any)[field] = value;
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const addNewItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { itemName: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const updated = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: updated });
  };

  // 🔹 Save invoice
  const handleSaveInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");

      toast({
        title: "✅ Invoice Created",
        description: `Invoice ${data.invoiceNumber} created successfully.`,
      });

      // ✅ Notify invoices page to refresh
      window.dispatchEvent(new Event("invoiceCreated"));

      // Reset form
      setShowForm(false);
      setNewInvoice({
        customerName: "",
        items: [{ itemName: "", quantity: 1, price: 0 }],
        paymentMode: "cash",
      });

      fetchCompletedOrders();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create invoice.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <Button onClick={() => setShowForm(true)} disabled={loading}>
          <PlusCircle className="h-4 w-4 mr-2" /> New Manual Invoice
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Customer Name</Label>
              <Input
                placeholder="Enter customer name"
                value={newInvoice.customerName}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, customerName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Menu Items</Label>
              {newInvoice.items.map((item, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <Input
                    placeholder="Item name"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(i, "itemName", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(i, "quantity", Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(i, "price", Number(e.target.value))}
                  />
                  {i > 0 && (
                    <Button variant="destructive" onClick={() => removeItem(i)}>
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addNewItem} className="mt-2">
                + Add Item
              </Button>
            </div>

            <div>
              <Label>Mode of Payment</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={newInvoice.paymentMode === "cash" ? "default" : "outline"}
                  onClick={() =>
                    setNewInvoice({ ...newInvoice, paymentMode: "cash" })
                  }
                >
                  <Wallet className="h-4 w-4 mr-2" /> Cash
                </Button>
                <Button
                  variant={newInvoice.paymentMode === "card" ? "default" : "outline"}
                  onClick={() =>
                    setNewInvoice({ ...newInvoice, paymentMode: "card" })
                  }
                >
                  <CreditCard className="h-4 w-4 mr-2" /> Card
                </Button>
                <Button
                  variant={newInvoice.paymentMode === "upi" ? "default" : "outline"}
                  onClick={() =>
                    setNewInvoice({ ...newInvoice, paymentMode: "upi" })
                  }
                >
                  <Smartphone className="h-4 w-4 mr-2" /> UPI
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSaveInvoice}
              disabled={loading}
              className="mt-4 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" /> Save Invoice
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {completedOrders.length === 0 ? (
              <p className="text-gray-500">No completed orders found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedOrders.map((order) => (
                  <Card key={order.id} className="border p-3">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {order.orderNumber} — {order.customerName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>
                        <strong>Table:</strong> {order.tableNumber || "-"}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className="text-green-600">{order.status}</span>
                      </p>
                      <Button
                        onClick={() => setShowForm(true)}
                        className="w-full mt-3"
                      >
                        <Receipt className="h-4 w-4 mr-2" /> Create Invoice
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
