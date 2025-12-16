"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

/* ===================================================
   Convert MongoDB ObjectId -> string
=================================================== */
function getUserId(user: any) {
  if (!user) return "";
  if (typeof user.id === "string") return user.id;
  if (user.id?.$oid) return user.id.$oid;
  return "";
}

export default function StaffSettings() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const roleColor: any = {
    admin: "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    chef: "bg-green-100 text-green-700",
    waiter: "bg-yellow-100 text-yellow-700",
  };

  /* ================= LOAD USERS ================= */
  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/get-users", { cache: "no-store" });
      const data = await res.json();

      if (data?.success && data.users) setStaff(data.users);
      else setStaff([]);
    } catch (err) {
      console.error("Error loading staff:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= Reload staff events ================= */
  useEffect(() => {
    const handler = () => loadUsers();
    window.addEventListener("reloadStaff", handler);
    return () => window.removeEventListener("reloadStaff", handler);
  }, []);

  /* ================= Close dropdown on click outside ================= */
  useEffect(() => {
    const close = () => setDropdownOpen(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* ================= Edit Modal ================= */
  function openEditModal(member: any) {
    setEditingMember(member);

    setEditForm({
      name: member.name ?? "",
      phone: member.phone ?? "",
      gender: member.gender ?? "",
      address: member.address ?? "",
      role: member.role ?? "waiter",
      image: member.image ?? null,
    });

    setEditPreview(member.image ?? null);
    setDropdownOpen(null);
    setIsEditOpen(true);
  }

  function handleEditImage(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditForm((prev: any) => ({ ...prev, image: base64 }));
      setEditPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveEdit() {
    if (!editingMember) return;
    setSaving(true);

    try {
      const userId = getUserId(editingMember);

      const res = await fetch(`/api/admin/update-user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update user");
        return;
      }

      setIsEditOpen(false);
      setEditingMember(null);
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  }

  /* ================= Delete User ================= */
  async function handleDeleteUser(member: any) {
    const yes = confirm(`Delete ${member.name}?`);
    if (!yes) return;

    try {
      const userId = getUserId(member);

      const res = await fetch(`/api/admin/delete-user/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Delete failed");
        return;
      }

      await loadUsers();
      setDropdownOpen(null);
    } catch (err) {
      alert("Failed to delete user");
    }
  }

  /* ================== UI ===================== */

  if (loading)
    return <p className="text-gray-500 text-lg">Loading staff...</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staff.length === 0 && (
          <p className="text-gray-600">No staff found.</p>
        )}

        {staff.map((member) => {
          const uid = getUserId(member);

          return (
            <Card key={uid} className="relative shadow-md border p-2">
              {/* 3 DOTS BUTTON */}
              <button
                className="absolute top-3 right-3 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(dropdownOpen === uid ? null : uid);
                }}
              >
                ⋮
              </button>

              {/* DROPDOWN */}
              {dropdownOpen === uid && (
                <div
                  className="absolute right-3 top-10 w-36 bg-white border rounded shadow z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                    onClick={() => openEditModal(member)}
                  >
                    Edit
                  </button>

                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
                    onClick={() => handleDeleteUser(member)}
                  >
                    Delete
                  </button>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={
                      member.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name
                      )}&background=ff8a00&color=fff`
                    }
                    className="w-16 h-16 rounded-full object-cover border"
                  />

                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    {member.staffId && (
                      <p className="text-xs mt-1 font-semibold text-gray-500">
                        ID: {member.staffId}
                      </p>
                    )}

                    <span
                      className={`px-2 py-1 text-xs rounded-md mt-1 inline-block ${
                        roleColor[member.role?.toLowerCase() || "waiter"]
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <Label>Email</Label>
                  <Input value={member.email} disabled />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input value={member.phone || ""} disabled />
                </div>

                <div>
                  <Label>Gender</Label>
                  <Input value={member.gender || ""} disabled />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input value={member.address || ""} disabled />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* =================== EDIT MODAL =================== */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>
              Modify staff details and save changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Name</Label>
              <Input
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Gender</Label>
              <Select
                value={editForm.gender || ""}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, gender: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Role</Label>
              <Select
                value={editForm.role || ""}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, role: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={editForm.address || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Profile Image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImage}
              />
              {editPreview && (
                <img
                  src={editPreview}
                  className="w-24 h-24 rounded-full border mt-2 object-cover"
                />
              )}
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              className="bg-gray-300"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>

            <Button
              className="bg-green-600 text-white"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
