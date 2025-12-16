import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  vegetarian: boolean;
  available: boolean;
  image?: string;
  description?: string;
  spicy?: boolean;
  popular?: boolean;
  glutenFree?: boolean;
  vegan?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("restaurant");
    const collection = db.collection<MenuItem>("menuItems");

    const { category, available } = req.query;

    const query: any = {};

    if (category && typeof category === "string") query.category = category;
    if (available === "true") query.available = true;
    if (available === "false") query.available = false;

    const menuItems = await collection.find(query).toArray();

    const formatted = menuItems.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      price: item.price,
      category: item.category,
      vegetarian: item.vegetarian,
      available: item.available,
      image: item.image || null,
      description: item.description || "",
      spicy: item.spicy || false,
      popular: item.popular || false,
      vegan: item.vegan || false,
      glutenFree: item.glutenFree || false,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
}
