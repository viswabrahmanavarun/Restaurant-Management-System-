"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

/* ----------------------------
   Types
---------------------------- */
type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  image?: string | null;
  description?: string | null;
  rating?: number | null;
  reviews?: number | null;
  veg?: boolean;
};

type CartItem = {
  id: string;
  menuItemId: string;   // ⭐ REQUIRED
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

/* ----------------------------
   Category Colors
---------------------------- */
const CATEGORY_COLORS: Record<string, string> = {
  all: "bg-orange-600 text-white",
  beverage: "bg-blue-500 text-white",
  beverages: "bg-blue-500 text-white",
  appetizer: "bg-orange-500 text-white",
  appetizers: "bg-orange-500 text-white",
  special: "bg-red-500 text-white",
  main: "bg-green-600 text-white",
  dessert: "bg-purple-500 text-white",
};

/* ----------------------------
   Helpers
---------------------------- */
const HERO_IMAGE =
  "https://previews.123rf.com/images/voltan1/voltan12207/voltan1220700074/189567177-paneer-butter-masala-indian-style-cottage-cheese-curry-in-bowls-over-white-background-top-view.jpg";

function formatRupee(n: number) {
  return `₹${n}`;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white/60 p-4 animate-pulse">
      <div className="h-36 bg-slate-200 rounded-lg mb-3" />
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  );
}

const FIXED_CATEGORIES = ["all", "beverage", "appetizer", "special", "main", "dessert"];

/* ----------------------------
   Main Page Component
---------------------------- */
export default function NewOrderPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<"veg" | "nonveg" | "all">("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [flyer, setFlyer] = useState<null | { src: string; x: number; y: number }>(null);
  const cartIconRef = useRef<HTMLButtonElement | null>(null);

  /* ----------------------------
     FETCH MENU
---------------------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/menuItem");
        const json = await res.json();

        const raw = Array.isArray(json) ? json : json.items || [];

        const items = raw.map((it: any) => {
          const lower = it.name.toLowerCase();
          const nonVegWords = ["chicken", "mutton", "fish", "egg", "beef", "pork"];
          const isNonVeg = nonVegWords.some((w) => lower.includes(w));

          return {
            id: it.id,
            name: it.name,
            category: (it.category || "main").toLowerCase(),
            price: Number(it.price),
            available: it.available,
            image: it.image ?? HERO_IMAGE,
            description: it.description ?? "",
            rating: it.rating ?? null,
            reviews: it.reviews ?? null,
            veg: !isNonVeg,
          } as MenuItem;
        });

        setMenu(items);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    load();
  }, []);

  /* ----------------------------
     FILTERING LOGIC
---------------------------- */
  const visibleItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    return menu.filter((m) => {
      const matchCategory = activeCategory === "all" || m.category.includes(activeCategory);
      const matchSearch =
        !q || m.name.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q);

      const matchVeg =
        vegFilter === "all" ? true : vegFilter === "veg" ? m.veg : !m.veg;

      return matchCategory && matchSearch && matchVeg;
    });
  }, [menu, search, vegFilter, activeCategory]);

  /* ----------------------------
     CART LOGIC
---------------------------- */
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (item: MenuItem, imgRef?: HTMLImageElement | null) => {
    if (imgRef && cartIconRef.current) {
      const rect = imgRef.getBoundingClientRect();
      setFlyer({ src: item.image ?? HERO_IMAGE, x: rect.left, y: rect.top });
      setTimeout(() => setFlyer(null), 700);
    }

    setCart((prev) => {
      const found = prev.find((x) => x.id === item.id);
      if (found)
        return prev.map((x) =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );

      return [
        {
          id: item.id,
          menuItemId: item.id, // ⭐ FIXED — REQUIRED FOR REVIEW PAGE
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        },
        ...prev,
      ];
    });

    setDrawerOpen(true);
  };

  const changeQty = (id: string, qty: number) =>
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, quantity: Math.max(1, qty) } : x))
        .filter((x) => x.quantity > 0)
    );

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((x) => x.id !== id));

  const clearCart = () => setCart([]);

  /* ----------------------------
     SUBMIT ORDER — FIXED MENUITEMID
---------------------------- */
  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast({ title: "Enter customer name" });
      return;
    }

    if (!cart.length) {
      toast({ title: "Cart is empty" });
      return;
    }

    const payload = {
      customerName,
      tableNumber,
      items: cart.map((c) => ({
        menuItemId: c.menuItemId, // ⭐ BACKEND NEEDS THIS
        quantity: c.quantity,
        price: c.price,
      })),
    };

    try {
      const res = await fetch("/api/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast({ title: "Order placed!" });
      clearCart();
      setDrawerOpen(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to create order", variant: "destructive" });
    }
  };

  /* ----------------------------
     SLIDING PILL LOGIC
---------------------------- */
  const totalTabs = FIXED_CATEGORIES.length;
  const activeIndex = FIXED_CATEGORIES.indexOf(activeCategory);
  const pillWidth = 100 / totalTabs;
  const pillLeft = (activeIndex >= 0 ? activeIndex : 0) * pillWidth;

  /* ----------------------------
     UI
---------------------------- */
  return (
    <div className="min-h-screen pb-32 bg-white">
      {/* HEADER */}
      <div className="px-6 py-6 bg-orange-100/60 rounded-b-3xl border-b">
        <h1 className="text-4xl font-extrabold text-orange-700">🧾 Create New Order</h1>

        <div className="mt-5 flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="max-w-xs bg-white"
          />

          <Input
            placeholder="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-40 bg-white"
          />

          <div className="ml-auto flex gap-2 items-center">
            <Input
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white"
            />
            <Button onClick={() => setSearch("")}>Clear</Button>
          </div>
        </div>

        {/* VEG FILTERS */}
        <div className="mt-4 flex gap-3">
          <Button
            onClick={() => setVegFilter("veg")}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              vegFilter === "veg"
                ? "bg-green-600 text-white"
                : "bg-white border text-slate-700"
            }`}
          >
            VEG
          </Button>

          <Button
            onClick={() => setVegFilter("nonveg")}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              vegFilter === "nonveg"
                ? "bg-red-600 text-white"
                : "bg-white border text-slate-700"
            }`}
          >
            NON VEG
          </Button>
        </div>

        {/* CATEGORY SLIDER */}
        <div className="mt-4 relative">
          <div className="relative bg-white rounded-full p-1 shadow-sm">
            <motion.div
              animate={{ left: `${pillLeft}%`, width: `${pillWidth}%` }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="absolute top-1 bottom-1 rounded-full bg-orange-500 shadow-md"
            />

            <div className="grid grid-cols-6 relative z-10">
              {FIXED_CATEGORIES.map((cat) => {
                const active = cat === activeCategory;

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`py-2 text-center font-semibold text-sm ${
                      active ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-[1300px] mx-auto px-6 mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="py-20 text-center text-slate-600">No results found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleItems.map((item) => (
              <FoodCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {/* FLY ANIMATION */}
      <AnimatePresence>
        {flyer && (
          <motion.img
            src={flyer.src}
            initial={{ x: flyer.x, y: flyer.y, width: 80, height: 60 }}
            animate={{
              x: cartIconRef.current?.getBoundingClientRect().left ?? flyer.x,
              y: cartIconRef.current?.getBoundingClientRect().top ?? flyer.y,
              width: 30,
              height: 22,
              opacity: 0.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed rounded-md z-[9999]"
          />
        )}
      </AnimatePresence>

      {/* FLOATING CART BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button ref={cartIconRef} className="rounded-full p-4 bg-orange-600 text-white shadow-lg">
          <ShoppingCart />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed right-0 top-0 w-full sm:w-[400px] h-full bg-white shadow-xl z-40"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Your Cart</h3>
                <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                  <X />
                </Button>
              </div>

              <div className="p-4 flex-1 overflow-auto space-y-3">
                {cart.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 border rounded-xl">
                    <img
                      src={c.image ?? HERO_IMAGE}
                      className="w-16 h-12 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm">₹{c.price}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" onClick={() => changeQty(c.id, c.quantity - 1)}>
                          -
                        </Button>
                        <span className="px-3 py-1 border rounded-lg">{c.quantity}</span>
                        <Button size="sm" onClick={() => changeQty(c.id, c.quantity + 1)}>
                          +
                        </Button>
                        <Button variant="ghost" className="ml-auto" onClick={() => removeItem(c.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-bold">₹{cartTotal}</span>
                </div>

                <Button className="w-full mt-3 bg-orange-600 text-white" onClick={handleSubmit}>
                  Place Order
                </Button>

                <Button variant="ghost" className="w-full mt-2" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------
   FOOD CARD
---------------------------- */
function FoodCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem, imgRef: HTMLImageElement | null) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  const categoryColor = CATEGORY_COLORS[item.category] || "bg-gray-300 text-black";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden">
        <div className="relative h-44">
          <img
            ref={(el) => (imgRef.current = el)}
            src={item.image ?? HERO_IMAGE}
            className="w-full h-full object-cover"
          />

          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}
          >
            {item.category}
          </span>

          <span
            className={`absolute top-3 right-3 w-4 h-4 rounded-full border ${
              item.veg ? "bg-green-600" : "bg-red-600"
            }`}
          ></span>
        </div>

        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
          <p className="text-xs text-slate-600">
            {item.rating ? `⭐ ${item.rating} (${item.reviews})` : "No rating"}
          </p>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>

          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-semibold text-orange-700">₹{item.price}</span>

            <Button
              className="bg-orange-600 text-white"
              onClick={() => onAdd(item, imgRef.current)}
            >
              <Plus size={16} /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
