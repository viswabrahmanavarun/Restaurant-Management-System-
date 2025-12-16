"use client";

import { useState } from "react";

export default function CreateUserForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "waiter",
    phone: "",
    gender: "",
    address: "",
    image: "",
  });

  const [preview, setPreview] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  /* ============================================================
     Image Upload + Preview
  ============================================================ */
  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm((prev) => ({ ...prev, image: base64 }));
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  /* ============================================================
     Submit Handler
     NOTE: role is lowercased here to match backend checks
  ============================================================ */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    // Ensure role sent to backend is lowercase
    const payload = {
      ...form,
      role: form.role.toLowerCase(),
    };

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error || "Failed to create user");
        return;
      }

      setMessage(`User created successfully! Staff ID: ${data.user?.staffId ?? "N/A"}`);

      // Notify staff list to reload
      window.dispatchEvent(new Event("reloadStaff"));

      // reset form
      setForm({
        name: "",
        email: "",
        password: "",
        role: "waiter",
        phone: "",
        gender: "",
        address: "",
        image: "",
      });
      setPreview("");
    } catch (err) {
      console.error("Create user error:", err);
      setMessage("Something went wrong while creating user");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {/* NAME */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="border p-2 w-full rounded-md"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      {/* EMAIL */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="border p-2 w-full rounded-md"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      {/* PHONE */}
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          className="border p-2 w-full rounded-md"
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      {/* GENDER */}
      <div>
        <label className="block text-sm font-medium mb-1">Gender</label>
        <select
          className="border p-2 w-full rounded-md"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">Select one</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* ADDRESS */}
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea
          className="border p-2 w-full rounded-md"
          placeholder="Full address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>

      {/* ROLE */}
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          className="border p-2 w-full rounded-md"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="manager">Manager</option>
          <option value="chef">Chef</option>
          <option value="waiter">Waiter</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* PASSWORD */}
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          className="border p-2 w-full rounded-md"
          placeholder="Create password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>

      {/* IMAGE */}
      <div>
        <label className="block text-sm font-medium mb-1">Profile Image</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {preview && (
          <img
            src={preview}
            className="h-24 w-24 rounded-full mt-2 border object-cover"
            alt="Preview"
          />
        )}
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-full bg-orange-600 text-white p-3 rounded-lg font-semibold"
      >
        Create User
      </button>

      {message && <p className="text-green-600 mt-2">{message}</p>}
    </form>
  );
}
