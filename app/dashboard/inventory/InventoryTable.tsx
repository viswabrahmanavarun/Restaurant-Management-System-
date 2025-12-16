"use client";

import React, { useState } from "react";
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  threshold: number;
  supplier?: string;
  imageUrl?: string;
  createdAt: string;
};

export default function InventoryTable({
  inventoryList,
  onRefresh,
}: {
  inventoryList: InventoryItem[];
  onRefresh: () => Promise<void>;
}) {
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    quantity: "",
    unit: "",
    pricePerUnit: "",
  });

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openEdit = (item: InventoryItem) => {
    setActiveItem(item);
    setEditValues({
      quantity: String(item.quantity),
      unit: item.unit,
      pricePerUnit: String(item.pricePerUnit),
    });
    setIsEditOpen(true);
  };

  const openDelete = (item: InventoryItem) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!activeItem) return;
    try {
      const res = await fetch(`/api/inventory/${activeItem.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: editValues.quantity,
          unit: editValues.unit,
          pricePerUnit: editValues.pricePerUnit,
        }),
      });

      if (!res.ok) throw new Error("Failed to update item");

      setIsEditOpen(false);
      setActiveItem(null);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update item");
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeItem) return;
    try {
      const res = await fetch(`/api/inventory/${activeItem.id}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete item");

      setIsDeleteOpen(false);
      setActiveItem(null);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Items</CardTitle>
      </CardHeader>

      <CardContent>
        {inventoryList.length === 0 ? (
          <p className="text-gray-500">No inventory items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Quantity</th>
                  <th className="p-2 text-left">Unit</th>
                  <th className="p-2 text-left">Price/Unit</th>
                  <th className="p-2 text-left">Supplier</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {inventoryList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>

                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">{item.unit}</td>
                    <td className="p-2">₹{item.pricePerUnit}</td>
                    <td className="p-2">{item.supplier || "—"}</td>
                    <td
                      className={`p-2 font-semibold ${
                        item.quantity < item.threshold ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {item.quantity < item.threshold ? "Low Stock" : "Sufficient"}
                    </td>

                    <td className="p-2 text-right">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="p-1 rounded hover:bg-gray-100"
                              aria-label="Actions"
                            >
                              <MoreHorizontal size={18} />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => openEdit(item)}
                              className="flex items-center gap-2"
                            >
                              <Edit2 size={16} /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openDelete(item)}
                              className="flex items-center gap-2 text-red-600"
                            >
                              <Trash2 size={16} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={editValues.quantity}
                onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
              />
            </div>

            <div>
              <Label>Unit</Label>
              <Input
                value={editValues.unit}
                onChange={(e) => setEditValues({ ...editValues, unit: e.target.value })}
              />
            </div>

            <div>
              <Label>Price per Unit</Label>
              <Input
                type="number"
                value={editValues.pricePerUnit}
                onChange={(e) =>
                  setEditValues({ ...editValues, pricePerUnit: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            <p>
              Are you sure you want to delete <b>{activeItem?.name}</b>? This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDelete}>
                Confirm Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
