"use client";

import { useState, useMemo } from "react";
import {
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui";

import {
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  ChevronsUpDown,   // 🔥 Updated icon
  Trash2,
  Edit2,
  Search,
} from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { ReservationType } from "./page";

type ReservationsTableProps = {
  reservations: ReservationType[];
};

export default function ReservationsTable({ reservations }: ReservationsTableProps) {
  const { toast } = useToast();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<ReservationType | null>(null);
  const [deleteModal, setDeleteModal] = useState<ReservationType | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | ReservationType["status"]>("ALL");
  const [sortBy, setSortBy] =
    useState<"date" | "guests" | "table" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const toggleMenu = (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const getStatusColor = (status: ReservationType["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ReservationType["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <AlertCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      const res = await fetch("/api/reservation/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteModal.id }),
      });

      if (!res.ok) throw new Error("Delete failed");

      toast({
        title: "Reservation Deleted",
        description: `Reservation ${deleteModal.id} deleted successfully.`,
      });

      setDeleteModal(null);
    } catch (err) {
      toast({
        title: "Failed to delete",
        description: "Unable to delete reservation.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editModal) return;

    try {
      const res = await fetch("/api/reservation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editModal),
      });

      if (!res.ok) throw new Error("Update failed");

      toast({
        title: "Reservation Updated",
        description: "Changes saved successfully.",
      });

      setEditModal(null);
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Could not save changes.",
        variant: "destructive",
      });
    }
  };

  const filtered = useMemo(() => {
    let list = [...reservations];

    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.id && r.id.toLowerCase().includes(q)) ||
          (r.reservationId && r.reservationId.toLowerCase().includes(q)) ||
          r.customerName.toLowerCase().includes(q) ||
          r.table.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "date":
          cmp = a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
          break;
        case "guests":
          cmp = a.guests - b.guests;
          break;
        case "table":
          cmp = a.table.localeCompare(b.table);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return list;
  }, [reservations, query, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (page > totalPages) setPage(1);

  if (!reservations || reservations.length === 0) {
    return (
      <p className="text-center text-gray-600 py-4">
        No reservations found.
      </p>
    );
  }

  return (
    <>
      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by customer, reservation id, or table..."
              value={query}
              onChange={(e: any) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as any);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 border rounded-md px-2 py-1">
            <ChevronsUpDown /> {/* ✔ Updated icon */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="date">Date</option>
              <option value="guests">Guests</option>
              <option value="table">Table</option>
              <option value="status">Status</option>
            </select>

            <button
              className="ml-2 text-sm px-2 py-1 border rounded"
              onClick={() =>
                setSortOrder((s) => (s === "asc" ? "desc" : "asc"))
              }
              title="Toggle sort order"
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Rows</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date • Time</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((r) => (
              <TableRow
                key={r.id}
                className="hover:bg-orange-50 transition-colors relative"
              >
                <TableCell className="font-medium">
                  {r.reservationId ?? r.id}
                </TableCell>
                <TableCell>{r.customerName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">{r.date}</span>
                    <span className="text-gray-500"> • {r.time}</span>
                  </div>
                </TableCell>
                <TableCell>{r.guests}</TableCell>
                <TableCell>{r.table}</TableCell>

                <TableCell>
                  <Badge
                    className={`inline-flex px-2 py-1 ${getStatusColor(
                      r.status
                    )} items-center gap-2 w-fit`}
                  >
                    {getStatusIcon(r.status)}
                    <span className="text-xs font-medium">{r.status}</span>
                  </Badge>
                </TableCell>

                <TableCell className="relative text-right">
                  <Button variant="ghost" onClick={() => toggleMenu(r.id)}>
                    <MoreHorizontal />
                  </Button>

                  {openMenu === r.id && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border z-20 w-40">
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                          setEditModal(r);
                          setOpenMenu(null);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
                        onClick={() => {
                          setDeleteModal(r);
                          setOpenMenu(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="py-8 text-center text-gray-500">
                    No reservations match your criteria.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600">
          Showing <strong>{(page - 1) * rowsPerPage + 1}</strong> to{" "}
          <strong>{Math.min(page * rowsPerPage, filtered.length)}</strong> of{" "}
          <strong>{filtered.length}</strong> reservations
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>

          <div className="px-3 py-1 border rounded text-sm">{page}</div>

          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">Edit Reservation</h2>
              <button
                className="text-gray-500"
                onClick={() => setEditModal(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Customer</label>
                <Input
                  value={editModal.customerName}
                  onChange={(e: any) =>
                    setEditModal({
                      ...editModal,
                      customerName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Guests</label>
                <Input
                  type="number"
                  value={editModal.guests}
                  onChange={(e: any) =>
                    setEditModal({
                      ...editModal,
                      guests: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Date</label>
                <Input
                  type="date"
                  value={editModal.date}
                  onChange={(e: any) =>
                    setEditModal({ ...editModal, date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Time</label>
                <Input
                  type="time"
                  value={editModal.time}
                  onChange={(e: any) =>
                    setEditModal({ ...editModal, time: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Table</label>
                <Input
                  value={editModal.table}
                  onChange={(e: any) =>
                    setEditModal({ ...editModal, table: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Status</label>
                <Select
                  value={editModal.status}
                  onValueChange={(v) =>
                    setEditModal({ ...editModal, status: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Notes</label>
                <Input
                  value={editModal.notes ?? ""}
                  onChange={(e: any) =>
                    setEditModal({ ...editModal, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditModal(null)}>
                Cancel
              </Button>
              <Button className="bg-orange-600 text-white" onClick={handleUpdate}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-red-600">
              Delete Reservation
            </h2>
            <p>
              Are you sure you want to delete reservation{" "}
              <strong>{deleteModal.reservationId ?? deleteModal.id}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>
                Cancel
              </Button>
              <Button className="bg-red-600 text-white" onClick={handleDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
