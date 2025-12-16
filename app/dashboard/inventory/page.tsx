"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Search, Grid, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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

export default function InventoryPage() {
  // Core states (original logic preserved)
  const [showForm, setShowForm] = useState(false);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [inventory, setInventory] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    pricePerUnit: "",
    threshold: "",
    supplier: "",
    imageUrl: "",
  });

  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);

  // NEW: UI/UX states
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE"); // toggle table/grid
  const [darkMode, setDarkMode] = useState(false);
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);

  // Fetch inventory from API (unchanged)
  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setInventoryList(data);
    } catch (err) {
      console.error("Fetch inventory failed:", err);
      setInventoryList([]);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCategorySelect = (category: string) => {
    setInventory((prev) => ({
      ...prev,
      category: prev.category === category ? "" : category,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventory),
      });

      if (res.ok) {
        await fetchInventory();
        setInventory({
          name: "",
          category: "",
          quantity: "",
          unit: "",
          pricePerUnit: "",
          threshold: "",
          supplier: "",
          imageUrl: "",
        });
        setShowForm(false);
        alert("✅ Inventory added successfully!");
      } else {
        alert("❌ Failed to add inventory");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while saving.");
    }
  };

  const handleEditSave = async () => {
    if (!editItem) return;
    try {
      const res = await fetch(`/api/inventory/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: editItem.quantity,
          unit: editItem.unit,
          pricePerUnit: editItem.pricePerUnit,
        }),
      });

      if (res.ok) {
        setEditItem(null);
        await fetchInventory();
        alert("✅ Inventory updated successfully!");
      } else {
        alert("❌ Failed to update item");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await fetch(`/api/inventory/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchInventory();
        setDeleteItem(null);
        alert("🗑️ Item deleted successfully!");
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filtering: search + tab
  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.supplier || "").toLowerCase().includes(q);

      const matchesTab = activeTab === "ALL" ? true : item.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [inventoryList, search, activeTab]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedInventory = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredInventory.slice(start, start + perPage);
  }, [filteredInventory, page, perPage]);

  // Analytics data
  const analytics = useMemo(() => {
    const totalItems = inventoryList.length;
    const totalValue = inventoryList.reduce(
      (acc, it) => acc + (it.pricePerUnit || 0) * (it.quantity || 0),
      0
    );
    const lowStockCount = inventoryList.filter((it) => it.quantity < it.threshold).length;

    // Category distribution
    const catMap: Record<string, number> = {};
    for (const it of inventoryList) {
      const c = it.category || "UNSPEC";
      catMap[c] = (catMap[c] || 0) + 1;
    }
    const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Recent additions (by createdAt)
    const recent = [...inventoryList]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 6)
      .map((it) => ({ name: it.name, qty: it.quantity }));

    return { totalItems, totalValue, lowStockCount, pieData, recent };
  }, [inventoryList]);

  const COLORS = ["#FFBB28", "#00C49F", "#FF8042", "#8B5CF6", "#EF4444", "#60A5FA"];

  // Small helpers
  const formatCurrency = (n: number) =>
    n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  return (
    <div className={darkMode ? "dark" : ""}>
      <motion.div
        className="min-h-screen p-6 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-4">
          {/* Search left */}
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-300 h-5 w-5" />
              <Input
                placeholder="Search item, category or supplier..."
                className="pl-10 py-2 shadow-sm rounded-lg"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Tab buttons (left of top bar for quick category) */}
            <div className="hidden md:flex items-center gap-2">
              {["ALL", "VEG", "NON_VEG", "VEGETABLES", "FRUITS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "bg-white/60 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:scale-105"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-2 rounded-md ${viewMode === "GRID" ? "bg-gray-100 dark:bg-gray-800" : "bg-transparent"}`}
                title="Grid view"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-2 rounded-md ${viewMode === "TABLE" ? "bg-gray-100 dark:bg-gray-800" : "bg-transparent"}`}
                title="Table view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-sm">Dark</Label>
              <Switch checked={darkMode} onCheckedChange={() => setDarkMode((s) => !s)} />
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-95 text-white px-4 py-2 shadow-md rounded-lg"
            >
              + Add Inventory
            </Button>
          </div>
        </div>

        {/* TABS (responsive below top bar for small screens) */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 md:hidden">
          {["ALL", "VEG", "NON_VEG", "VEGETABLES", "FRUITS"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                  : "bg-white/60 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Analytics */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 rounded-xl shadow-lg bg-white/80 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-md bg-white/70 dark:bg-gray-700 shadow-inner">
                    <div className="text-sm text-gray-500">Total Items</div>
                    <div className="text-xl font-bold">{analytics.totalItems}</div>
                  </div>
                  <div className="p-3 rounded-md bg-white/70 dark:bg-gray-700 shadow-inner">
                    <div className="text-sm text-gray-500">Low Stock</div>
                    <div className="text-xl font-bold text-red-500">{analytics.lowStockCount}</div>
                  </div>
                  <div className="p-3 rounded-md bg-white/70 dark:bg-gray-700 shadow-inner col-span-2">
                    <div className="text-sm text-gray-500">Total Value</div>
                    <div className="text-xl font-bold">{formatCurrency(analytics.totalValue)}</div>
                  </div>
                </div>

                <div className="mt-4 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={60}
                        innerRadius={28}
                        paddingAngle={4}
                      >
                        {analytics.pieData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 rounded-xl shadow-lg bg-white/80 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Recent additions</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recent.length === 0 ? (
                  <div className="text-sm text-gray-500">No recent items</div>
                ) : (
                  <div className="space-y-2">
                    {analytics.recent.map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-gray-500">{r.qty} pcs</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Main content (table or grid) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Controls: filters, per page */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Label>Show</Label>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 rounded-md bg-white/60 dark:bg-gray-800"
                >
                  {[6, 8, 12, 24].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>

                <Label className="ml-4">Tab:</Label>
                <div className="px-2 py-1 rounded-md bg-white/60 dark:bg-gray-800">
                  <span className="text-sm font-medium">{activeTab}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  {filteredInventory.length} results
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => { setSearch(""); setActiveTab("ALL"); }}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* View: TABLE */}
            {viewMode === "TABLE" && (
              <Card className="rounded-xl shadow-lg bg-white/80 dark:bg-gray-800">
                <CardContent>
                  {filteredInventory.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">No items found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] table-auto">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr>
                            <th className="p-3 text-left">Image</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Quantity</th>
                            <th className="p-3 text-left">Unit</th>
                            <th className="p-3 text-left">Price/Unit</th>
                            <th className="p-3 text-left">Supplier</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedInventory.map((item) => (
                            <motion.tr
                              key={item.id}
                              className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <td className="p-3">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                                    N/A
                                  </div>
                                )}
                              </td>
                              <td className="p-3">{item.name}</td>
                              <td className="p-3">{item.category}</td>
                              <td className="p-3">{item.quantity}</td>
                              <td className="p-3">{item.unit}</td>
                              <td className="p-3">₹{item.pricePerUnit}</td>
                              <td className="p-3">{item.supplier || "—"}</td>
                              <td className={`p-3 font-semibold ${item.quantity < item.threshold ? "text-red-500" : "text-green-600"}`}>
                                {item.quantity < item.threshold ? "Low Stock" : "Sufficient"}
                              </td>
                              <td className="p-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditItem(item)}>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteItem(item)}>
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* View: GRID (cards) */}
            {viewMode === "GRID" && (
              <div>
                {filteredInventory.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No items to display.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pagedInventory.map((item) => (
                      <motion.div
                        key={item.id}
                        className="rounded-xl shadow-lg overflow-hidden bg-white/80 dark:bg-gray-800"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="relative h-40">
                          {item.imageUrl ? (
                            // image
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-lg font-semibold">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </div>

                            <div className="flex flex-col items-end">
                              <div className="text-sm">{item.quantity} {item.unit}</div>
                              <div className="text-sm font-bold">₹{item.pricePerUnit}</div>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <div className={`text-sm font-medium ${item.quantity < item.threshold ? "text-red-500" : "text-green-600"}`}>
                              {item.quantity < item.threshold ? "Low Stock" : "Sufficient"}
                            </div>

                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditItem(item)}>Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setDeleteItem(item)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination for grid */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                    <Button variant="ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* EDIT DIALOG */}
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
            </DialogHeader>
            {editItem && (
              <div className="space-y-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editItem.quantity}
                    onChange={(e) =>
                      setEditItem({ ...editItem, quantity: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={editItem.unit}
                    onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Price per Unit</Label>
                  <Input
                    type="number"
                    value={editItem.pricePerUnit}
                    onChange={(e) =>
                      setEditItem({ ...editItem, pricePerUnit: Number(e.target.value) })
                    }
                  />
                </div>

                <DialogFooter>
                  <Button onClick={handleEditSave} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Save Changes</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* DELETE DIALOG */}
        <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete "{deleteItem?.name}"?</p>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-500 text-white">Confirm Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ADD INVENTORY (FORM) — keeps original fields and logic unchanged */}
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-4 rounded-xl shadow-lg bg-white/90 dark:bg-gray-800 fixed right-6 bottom-6 w-full max-w-xl z-50">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg">Add New Inventory</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setShowForm(false)}>Close</Button>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label>Item Name</Label>
                    <Input placeholder="Enter item name" value={inventory.name} onChange={(e) => setInventory({ ...inventory, name: e.target.value })} />
                  </div>

                  <div>
                    <Label>Image URL</Label>
                    <Input placeholder="Enter image URL" value={inventory.imageUrl} onChange={(e) => setInventory({ ...inventory, imageUrl: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Quantity</Label>
                      <Input type="number" placeholder="Enter quantity" value={inventory.quantity} onChange={(e) => setInventory({ ...inventory, quantity: e.target.value })} />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input placeholder="e.g. kg, L, pcs" value={inventory.unit} onChange={(e) => setInventory({ ...inventory, unit: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Price per Unit</Label>
                      <Input type="number" placeholder="e.g. 50" value={inventory.pricePerUnit} onChange={(e) => setInventory({ ...inventory, pricePerUnit: e.target.value })} />
                    </div>
                    <div>
                      <Label>Threshold Quantity</Label>
                      <Input type="number" placeholder="Minimum stock alert" value={inventory.threshold} onChange={(e) => setInventory({ ...inventory, threshold: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <Label>Supplier</Label>
                    <Input placeholder="Enter supplier name (optional)" value={inventory.supplier} onChange={(e) => setInventory({ ...inventory, supplier: e.target.value })} />
                  </div>

                  <div>
                    <Label className="mb-2 block">Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {["VEGETABLES", "FRUITS", "VEG", "NON_VEG"].map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Switch checked={inventory.category === cat} onCheckedChange={() => handleCategorySelect(cat)} />
                          <span>{cat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Save Inventory</Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
