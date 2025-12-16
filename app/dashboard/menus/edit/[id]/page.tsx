"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditMenuItem({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    prepTime: "",
    image: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch(`/api/menuItem/${params.id}`);
      const data = await res.json();
      setForm(data);
    };
    loadData();
  }, [params.id]);

  const handleUpdate = async () => {
    const res = await fetch(`/api/menuItem/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Item updated!");
      router.push("/dashboard/menus");
    } else {
      alert("Failed to update");
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Edit Menu Item</h1>

      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Input
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
      />

      <Input
        placeholder="Prep Time"
        value={form.prepTime}
        onChange={(e) => setForm({ ...form, prepTime: Number(e.target.value) })}
      />

      <Input
        placeholder="Image URL"
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
      />

      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
}
