"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  User,
  Phone,
  Mail,
  List,
  FileText,
  Building,
  Edit2,
  Trash2,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  notes?: string;
}

export default function SuppliersPage() {
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  // NewSupplier state (for "Add")
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    category: "",
    notes: "",
  });

  // Edit state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Delete state
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Dialog open (Add)
  const [addOpen, setAddOpen] = useState(false);

  // UI helpers: search, pagination, sort
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const data = (await res.json()) as Supplier[];
      setSuppliers(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading suppliers",
        description: "Could not fetch suppliers from server.",
        variant: "destructive",
      });
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // no polling required here; keep single fetch
  }, []);

  // Basic validation for add/edit
  const validateSupplierPayload = (payload: {
    name: string;
    phone: string;
    email: string;
  }) => {
    if (!payload.name.trim()) return "Name is required.";
    if (!payload.phone.trim()) return "Phone is required.";
    if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) return "Email is invalid.";
    return null;
  };

  // Add supplier
  const handleAddSupplier = async () => {
    const err = validateSupplierPayload({ name: newSupplier.name, phone: newSupplier.phone, email: newSupplier.email });
    if (err) {
      toast({ title: "Validation", description: err, variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create supplier");
      }

      toast({ title: "Supplier added", description: `${newSupplier.name} was added.` });
      setAddOpen(false);
      setNewSupplier({ name: "", contactPerson: "", phone: "", email: "", category: "", notes: "" });
      await fetchSuppliers();
      setPage(1); // show first page after adding
    } catch (error) {
      console.error(error);
      toast({ title: "Create failed", description: "Unable to add supplier.", variant: "destructive" });
    }
  };

  // Open edit dialog (prefill)
  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setIsEditOpen(true);
  };

  // Save edit
  const handleEditSave = async () => {
    if (!editingSupplier) return;
    const err = validateSupplierPayload({ name: editingSupplier.name, phone: editingSupplier.phone, email: editingSupplier.email });
    if (err) {
      toast({ title: "Validation", description: err, variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSupplier),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update supplier");
      }

      toast({ title: "Updated", description: `${editingSupplier.name} updated.` });
      setIsEditOpen(false);
      setEditingSupplier(null);
      await fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast({ title: "Update failed", description: "Unable to update supplier", variant: "destructive" });
    }
  };

  // Open delete confirmation
  const openDelete = (s: Supplier) => {
    setDeletingSupplier(s);
    setIsDeleteOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    try {
      const res = await fetch(`/api/suppliers/${deletingSupplier.id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete");
      }

      toast({ title: "Deleted", description: `${deletingSupplier.name} removed.` });
      setIsDeleteOpen(false);
      setDeletingSupplier(null);
      await fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast({ title: "Delete failed", description: "Could not delete supplier.", variant: "destructive" });
    }
  };

  // Filtering, sorting and pagination
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = suppliers.filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.contactPerson || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.category || "").toLowerCase().includes(q)
      );
    });

    list = list.sort((a, b) => {
      const vA = (a[sortBy] || "").toString().toLowerCase();
      const vB = (b[sortBy] || "").toString().toLowerCase();
      if (vA < vB) return sortDir === "asc" ? -1 : 1;
      if (vA > vB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [suppliers, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // Small UI helpers
  const toggleSort = (field: "name" | "category") => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Suppliers</CardTitle>
            <p className="text-sm text-gray-500">Manage suppliers — add, edit, or remove supplier records.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input
                placeholder="Search name, contact, phone, email, category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Add Button */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Add Supplier</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Supplier Name"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier((s) => ({ ...s, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Contact Person"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier((s) => ({ ...s, contactPerson: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier((s) => ({ ...s, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier((s) => ({ ...s, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Category (e.g. Ghee, Milk, Oil)"
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier((s) => ({ ...s, category: e.target.value }))}
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier((s) => ({ ...s, notes: e.target.value }))}
                  />
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddSupplier} className="bg-orange-500 hover:bg-orange-600 text-white">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Building size={14} />
                      Name
                      <button onClick={() => toggleSort("name")} className="ml-2">
                        {sortBy === "name" ? (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                      </button>
                    </div>
                  </TableHead>

                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      Contact Person
                    </div>
                  </TableHead>

                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      Phone
                    </div>
                  </TableHead>

                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      Email
                    </div>
                  </TableHead>

                  <TableHead>
                    <div className="flex items-center gap-2">
                      <List size={14} />
                      <span>Category</span>
                      <button onClick={() => toggleSort("category")} className="ml-2">
                        {sortBy === "category" ? (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                      </button>
                    </div>
                  </TableHead>

                  <TableHead>
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      Notes
                    </div>
                  </TableHead>

                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.contactPerson}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell>{s.notes || "-"}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEdit(s)}
                            >
                              <div className="flex items-center gap-2">
                                <Edit2 size={14} /> Edit
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDelete(s)}
                            >
                              <div className="flex items-center gap-2 text-destructive">
                                <Trash2 size={14} /> Delete
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-6 text-center text-gray-500">
                        {loading ? "Loading suppliers..." : "No suppliers found."}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft />
              </Button>
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Per page</div>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md bg-white/60 px-2 py-1"
              >
                {[5, 8, 12, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setEditingSupplier(null); } setIsEditOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>

          {editingSupplier && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Supplier Name"
                value={editingSupplier.name}
                onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
              />
              <Input
                placeholder="Contact Person"
                value={editingSupplier.contactPerson}
                onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={editingSupplier.phone}
                onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={editingSupplier.email}
                onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={editingSupplier.category}
                onChange={(e) => setEditingSupplier({ ...editingSupplier, category: e.target.value })}
              />
              <Input
                placeholder="Notes"
                value={editingSupplier.notes || ""}
                onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
              />

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingSupplier(null); }}>Cancel</Button>
                <Button onClick={handleEditSave} className="bg-orange-500 hover:bg-orange-600 text-white">Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) setDeletingSupplier(null); setIsDeleteOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            Are you sure you want to delete <strong>{deletingSupplier?.name}</strong>? This action cannot be undone.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setDeletingSupplier(null); }}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 text-white">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
