"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, TrendingUp, Star, MoreHorizontal, Edit, Trash, Eye } from "lucide-react";

export default function AvailableMenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch available menu items
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch("/api/menuItem");
      const data = await res.json();
      const available = data.filter((item: any) => item.available);
      setMenuItems(available);
    } catch (err) {
      console.error("Error loading menu items:", err);
    }
  };

  // Update item
  const handleSave = async () => {
    try {
      await fetch(`/api/menuItem/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      setIsEditOpen(false);
      setEditingItem(null);
      loadItems();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  // Delete item
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/menuItem/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      loadItems();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // Category color styling
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "appetizer":
        return "bg-blue-100 text-blue-800";
      case "main":
        return "bg-purple-100 text-purple-800";
      case "dessert":
        return "bg-pink-100 text-pink-800";
      case "beverage":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">

      {/* ===================== TABLE ===================== */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Prep Time</TableHead>
            <TableHead>Sold Today</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {menuItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
              </TableCell>

              <TableCell className="font-medium">₹{item.price}</TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {item.prepTime ?? 0} min
                </div>
              </TableCell>

              {/* SOLD TODAY */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {item.soldToday ?? 0}
                </div>
              </TableCell>

              {/* RATING */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  {item.rating ?? 0}
                </div>
              </TableCell>

              {/* ACTIONS MENU */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => alert("Show details modal here")}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Item
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ===================== EDIT MODAL ===================== */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Item Name"
              />

              <Input
                value={editingItem.price}
                type="number"
                onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                placeholder="Price"
              />

              <Input
                value={editingItem.prepTime}
                type="number"
                onChange={(e) => setEditingItem({ ...editingItem, prepTime: Number(e.target.value) })}
                placeholder="Prep Time"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DELETE CONFIRM ===================== */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>

          <p>This item will be permanently deleted.</p>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
