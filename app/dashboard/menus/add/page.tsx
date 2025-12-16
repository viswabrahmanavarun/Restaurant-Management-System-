"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { id: "appetizer", name: "Appetizer" },
  { id: "main", name: "Main Course" },
  { id: "dessert", name: "Dessert" },
  { id: "beverage", name: "Beverage" },
  { id: "special", name: "Chef's Special" },
];

export default function AddMenuItemPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [profit, setProfit] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [calories, setCalories] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [category, setCategory] = useState(categories[0].id);
  const [image, setImage] = useState("");
  const [vegetarian, setVegetarian] = useState(true);
  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [spicy, setSpicy] = useState(false);
  const [popular, setPopular] = useState(false);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  // Handle Veg/Non-Veg toggle (one switch)
  const handleVegToggle = () => setVegetarian(!vegetarian);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/menuItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          cost: Number(cost),
          profit: Number(profit),
          prepTime: Number(prepTime),
          calories: Number(calories),
          category,
          image,
          ingredients: ingredients
            ? ingredients.split(",").map((i) => i.trim())
            : [],
          allergens: allergens
            ? allergens.split(",").map((i) => i.trim())
            : [],
          vegetarian,
          vegan,
          glutenFree,
          spicy,
          popular,
          available,
        }),
      });

      if (!res.ok) throw new Error("Failed to add menu item");

      router.push("/dashboard/menus");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Menu Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input type="number" placeholder="Cost" value={cost} onChange={(e) => setCost(e.target.value)} />
          <Input type="number" placeholder="Profit" value={profit} onChange={(e) => setProfit(e.target.value)} />
          <Input type="number" placeholder="Prep Time (mins)" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
          <Input type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </div>

        <Select onValueChange={(val) => setCategory(val)} defaultValue={category}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input placeholder="Image URL (optional)" value={image} onChange={(e) => setImage(e.target.value)} />
        <Input placeholder="Ingredients (comma separated)" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
        <Input placeholder="Allergens (comma separated)" value={allergens} onChange={(e) => setAllergens(e.target.value)} />

        {/* Veg / Non-Veg toggle */}
        <div className="flex items-center justify-between py-2">
          <Label className="font-medium">Veg / Non-Veg</Label>
          <div
            className={`flex items-center px-3 py-1 rounded-full cursor-pointer border transition-colors ${
              vegetarian ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"
            }`}
            onClick={handleVegToggle}
          >
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                vegetarian ? "bg-green-600" : "bg-red-600"
              }`}
            ></span>
            {vegetarian ? "Veg" : "Non-Veg"}
          </div>
        </div>

        {/* Boolean Switches */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label>Vegan</Label>
            <Switch checked={vegan} onCheckedChange={setVegan} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Gluten Free</Label>
            <Switch checked={glutenFree} onCheckedChange={setGlutenFree} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Spicy</Label>
            <Switch checked={spicy} onCheckedChange={setSpicy} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Popular</Label>
            <Switch checked={popular} onCheckedChange={setPopular} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Available</Label>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
          {loading ? "Adding..." : "Add Item"}
        </Button>
      </form>
    </div>
  );
}
