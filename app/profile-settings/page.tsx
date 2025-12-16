"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfileSettingsPage() {
  const [form, setForm] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    fetch(`/api/profile?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setForm(data.user);
          setPreview(data.user.image);
        }
      });
  }, []);

  const handleImage = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result as string });
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");

    const res = await fetch("/api/staff/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userId }),
    });

    if (res.ok) alert("Profile updated!");
    else alert("Failed to update profile");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Edit Profile</h1>

      <div className="space-y-3">
        <Label>Name</Label>
        <Input
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Label>Phone</Label>
        <Input
          value={form.phone || ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <Label>Gender</Label>
        <Input
          value={form.gender || ""}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        />

        <Label>Address</Label>
        <Input
          value={form.address || ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <Label>Profile Image</Label>
        <Input type="file" accept="image/*" onChange={handleImage} />

        {preview && (
          <img
            src={preview}
            className="w-24 h-24 rounded-full border mt-2 object-cover"
          />
        )}
      </div>

      <Button onClick={handleSave} className="bg-green-600 text-white">
        Save Changes
      </Button>
    </div>
  );
}
