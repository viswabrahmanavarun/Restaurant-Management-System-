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
import { Plus, Loader2, Trash } from "lucide-react";

export default function NewKOTDialog({ onKOTCreated }: { onKOTCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState("");
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState([{ menuItem: "", quantity: 1 }]);
  const [loading, setLoading] = useState(false);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { menuItem: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!table || items.some((i) => !i.menuItem)) {
      alert("Please fill in table and item details.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/kot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          customer,
          items,
          orderStatus: "NEW",
        }),
      });

      if (res.ok) {
        onKOTCreated();
        setOpen(false);
        setTable("");
        setCustomer("");
        setItems([{ menuItem: "", quantity: 1 }]);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create KOT");
      }
    } catch (err) {
      console.error("Error creating KOT:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New KOT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New KOT</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>Table Number</Label>
            <Input value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. T3" />
          </div>

          <div>
            <Label>Customer Name (Optional)</Label>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Ramesh"
            />
          </div>

          <div className="space-y-3">
            <Label>Items</Label>
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Menu Item"
                  value={item.menuItem}
                  onChange={(e) => handleItemChange(i, "menuItem", e.target.value)}
                />
                <Input
                  type="number"
                  min="1"
                  className="w-20"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(i, "quantity", Number(e.target.value))}
                />
                {items.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addItem} className="w-full">
              Add Item
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create KOT"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
