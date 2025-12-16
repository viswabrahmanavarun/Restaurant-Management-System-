"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  profit: number;
  prepTime: number;
  calories: number;
  ingredients: string[];
  allergens: string[];
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  spicy: boolean;
  popular: boolean;
  available: boolean;
  image?: string;
}

export default function CategoriesPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await fetch("/api/menuItem");
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
      }
    };
    fetchMenuItems();
  }, []);

  // All unique categories
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  // Filter based on category & search
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Category Items</h1>

        {/* Category Dropdown Filter */}
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Input */}
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative w-full h-40">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription className="line-clamp-2 mb-2">
                {item.description}
              </CardDescription>

              {/* Veg/Non-Veg & Tags */}
              <div className="flex flex-wrap gap-2 text-xs mb-2">
                <Badge
                  className={
                    item.vegetarian
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {item.vegetarian ? "Veg" : "Non-Veg"}
                </Badge>
                {item.vegan && (
                  <Badge className="bg-emerald-100 text-emerald-800">Vegan</Badge>
                )}
                {item.glutenFree && (
                  <Badge className="bg-teal-100 text-teal-800">Gluten Free</Badge>
                )}
                {item.spicy && (
                  <Badge className="bg-red-100 text-red-800">Spicy</Badge>
                )}
                {item.popular && (
                  <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>
                )}
              </div>
            </CardHeader>

            {/* 2-column details */}
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong>Category:</strong> {item.category}
                </p>
                <p>
                  <strong>Price:</strong> ₹{item.price}
                </p>
                <p>
                  <strong>Cost:</strong> ₹{item.cost}
                </p>
                <p>
                  <strong>Profit:</strong> ₹{item.profit}
                </p>
                <p>
                  <strong>Prep Time:</strong> {item.prepTime} mins
                </p>
                <p>
                  <strong>Calories:</strong> {item.calories} kcal
                </p>
                <p>
                  <strong>Ingredients:</strong>{" "}
                  {item.ingredients?.join(", ") || "N/A"}
                </p>
                <p>
                  <strong>Allergens:</strong>{" "}
                  {item.allergens?.join(", ") || "None"}
                </p>
              </div>
              <p
                className={`font-semibold mt-2 ${
                  item.available ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.available ? "Available" : "Unavailable"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
