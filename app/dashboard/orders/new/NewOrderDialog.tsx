"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function NewOrderDialog({
  onOrderCreated,
}: {
  onOrderCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [items, setItems] = useState([{ menuItem: "", quantity: 1, price: 0 }]);
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { menuItem: "", quantity: 1, price: 0 }]);
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (
      !tableNumber.trim() ||
      items.some((i) => !i.menuItem.trim() || i.quantity <= 0 || i.price <= 0)
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    setLoading(true);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          isWalkIn: true, // 👈 new explicit field
          items,
          totalAmount,
        }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      setOpen(false);
      setTableNumber("");
      setItems([{ menuItem: "", quantity: 1, price: 0 }]);
      onOrderCreated?.();
    } catch (error) {
      console.error(error);
      alert("Error creating order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          + Add Order
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Walk-in Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* ✅ Table Number (Manual Entry) */}
          <div>
            <Label>Table Number</Label>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="E.g., T1, T2, T3"
            />
          </div>

          {/* ✅ Items Section */}
          <div>
            <Label>Items</Label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  placeholder="Menu Item"
                  value={item.menuItem}
                  onChange={(e) =>
                    handleItemChange(index, "menuItem", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", parseInt(e.target.value))
                  }
                />
                <Input
                  type="number"
                  placeholder="Price"
                  min={1}
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(index, "price", parseFloat(e.target.value))
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-orange-600 border-orange-300"
              onClick={handleAddItem}
            >
              + Add Item
            </Button>
          </div>

          {/* ✅ Submit */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
