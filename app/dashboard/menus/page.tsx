"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Trash2,
  Edit2,
  Search,
  Star,
  MessageSquarePlus,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ----- shadcn DropdownMenu imports ----- */
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/* ---------------------------
   Use the provided image path
   --------------------------- */
const PLACEHOLDER = "/mnt/data/9d682acb-8886-430e-a4ec-2d631445b689.png";

/* ===========================================================
   Types
   =========================================================== */
interface Review {
  rating: number;
  comment: string;
}

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
  image?: string | null;
  menuReviews: Review[];
  rating?: number;
  reviews?: number;
}

/* ===========================================================
   Helper CSS-in-JS strings (keeps Tailwind + small custom CSS)
   =========================================================== */

/* We'll include a small style block for skeleton shimmer and any custom keyframes */
const extraStyles = `
/* shimmer */
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.2s linear infinite;
}

/* hide native scrollbar for the tabs area */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* subtle glass shine overlay (used on hover) */
.card-shine:after{
  content: '';
  position:absolute;
  top:-60%;
  left:-50%;
  width: 40%;
  height: 220%;
  transform: rotate(25deg);
  background: linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.02));
  opacity: 0;
  transition: all 0.6s ease;
  pointer-events:none;
}
.card-glass:hover .card-shine:after { opacity: 1; left: 120%; transition: all 0.9s cubic-bezier(.2,.9,.2,1); }

/* masonry-like column adjustments for responsive Pinterest look */
.masonry {
  column-gap: 1.25rem;
}
@media (min-width: 1024px) {
  .masonry { column-count: 3; }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .masonry { column-count: 2; }
}
@media (max-width: 767px) {
  .masonry { column-count: 1; }
}

/* ensure card items break-inside */
.masonry-item { break-inside: avoid; margin-bottom: 1.25rem; display: inline-block; width: 100%; }

/* card glass effect (backdrop blur + translucent) */
.card-glass {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* subtle elevated hover */
.card-glass:hover {
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
  transform: translateY(-6px) scale(1.01);
}
`;

/* ===========================================================
   Component
   =========================================================== */
export default function MenusPage() {
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [vegFilter, setVegFilter] = useState<"veg" | "nonveg" | "none">(
    "none"
  );
  const [openDropdownFor, setOpenDropdownFor] = useState<string | null>(null);

  // EDIT MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  /* infinite scroll */
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchInProgress = useRef(false);

  const CATEGORIES = ["beverage", "appetizer", "main", "special", "dessert"];

  const CATEGORY_BADGES: Record<string, string> = {
    beverage: "bg-purple-100 text-purple-800",
    appetizer: "bg-orange-100 text-orange-800",
    main: "bg-blue-100 text-blue-800",
    special: "bg-pink-100 text-pink-800",
    dessert: "bg-indigo-100 text-indigo-800",
  };

  const EXTRA_BADGES: Record<string, string> = {
    veg: "bg-green-100 text-green-800",
    nonveg: "bg-red-100 text-red-800",
    spicy: "bg-red-200 text-red-900",
    popular: "bg-yellow-100 text-yellow-800",
  };

  function getCategoryBadgeClass(cat?: string) {
    if (!cat) return "bg-gray-100 text-gray-800";
    const key = cat.toLowerCase();
    return CATEGORY_BADGES[key] ?? "bg-gray-100 text-gray-800";
  }

  function getExtraBadgeClass(type: "veg" | "nonveg" | "spicy" | "popular") {
    return EXTRA_BADGES[type] ?? "bg-gray-100 text-gray-800";
  }

  /* ===========================================================
     Fetch items (supports pagination: /api/menuItem?page=n)
     If your backend doesn't support page param, it will gracefully
     fallback to single response and paginate client-side.
     =========================================================== */
  const loadItems = useCallback(
    async (opts?: { page?: number; replace?: boolean }) => {
      const p = opts?.page ?? 1;
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;

      try {
        if (p === 1) {
          setLoading(true);
          setSkeletonLoading(true);
        }

        const res = await fetch(`/api/menuItem?page=${p}`);
        if (!res.ok) {
          // fallback: try without page param
          const r2 = await fetch("/api/menuItem");
          if (!r2.ok) throw new Error("Failed to load");
          const itemsAll = await r2.json();
          // simulate pagination client-side
          const pageSize = 12;
          const start = (p - 1) * pageSize;
          const chunk = itemsAll.slice(start, start + pageSize);
          if (chunk.length === 0) setHasMore(false);

          const processedChunk = chunk.map((it: MenuItem) => {
            const reviews = it.menuReviews || [];
            const avg =
              reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
            return {
              ...it,
              rating: Number(avg.toFixed(1)),
              reviews: reviews.length,
              ingredients: Array.isArray(it.ingredients) ? it.ingredients : [],
              allergens: Array.isArray(it.allergens) ? it.allergens : [],
            };
          });

          setMenuItems((prev) => (opts?.replace ? processedChunk : [...prev, ...processedChunk]));
        } else {
          const items = await res.json();
          // if API returns { items: [...], hasMore: true/false } handle both formats
          let payload: any[] = [];
          let serverHasMore = true;

          if (Array.isArray(items)) {
            payload = items;
            // infer hasMore if less than typical page size
            serverHasMore = items.length >= 12;
          } else if (items && Array.isArray(items.items)) {
            payload = items.items;
            serverHasMore = items.hasMore ?? payload.length >= 12;
          } else {
            payload = [];
            serverHasMore = false;
          }

          const processed = payload.map((it: MenuItem) => {
            const reviews = it.menuReviews || [];
            const avg =
              reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

            return {
              ...it,
              rating: Number(avg.toFixed(1)),
              reviews: reviews.length,
              ingredients: Array.isArray(it.ingredients) ? it.ingredients : [],
              allergens: Array.isArray(it.allergens) ? it.allergens : [],
            };
          });

          setMenuItems((prev) => (opts?.replace ? processed : [...prev, ...processed]));
          setHasMore(serverHasMore);
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "Error loading menu",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        // give a little time to show skeleton shimmer nicely
        setTimeout(() => setSkeletonLoading(false), 300);
        fetchInProgress.current = false;
      }
    },
    []
  );

  useEffect(() => {
    // initial load
    loadItems({ page: 1, replace: true });
    setPage(1);
  }, [loadItems]);

  /* infinite scroll observer */
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !fetchInProgress.current) {
            const next = page + 1;
            setPage(next);
            loadItems({ page: next });
          }
        });
      },
      { root: null, rootMargin: "300px", threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loadItems]);

  /* ===========================================================
     Filtering
     =========================================================== */
  const filtered = menuItems.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchCategory =
      activeTab === "all" ||
      item.category.toLowerCase() === activeTab.toLowerCase();

    const matchVeg =
      vegFilter === "none"
        ? true
        : vegFilter === "veg"
        ? item.vegetarian
        : !item.vegetarian;

    return matchSearch && matchCategory && matchVeg;
  });

  /* ===========================================================
     Staggered animation configuration (framer-motion)
     =========================================================== */
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  // each card will have a slight random offset for "fall" feel
  function cardMotion(seed: number) {
    const tilt = (seed % 3) - 1; // -1,0,1
    const yStart = 24 + (seed % 5) * 6; // 24..48
    return {
      hidden: { opacity: 0, y: yStart, rotate: tilt * 2, scale: 0.98 },
      visible: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
      exit: { opacity: 0, y: 8, transition: { duration: 0.18 } },
    };
  }

  /* ===========================================================
     Stars renderer
     =========================================================== */
  function renderStars(rating = 0) {
    return (
      <div className="flex gap-0.5 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  }

  /* ===========================================================
     Delete handler
     =========================================================== */
  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;

    try {
      const res = await fetch(`/api/menuItem/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setMenuItems((prev) => prev.filter((it) => it.id !== id));
      toast({ title: "Deleted", description: "Item removed." });
    } catch (err) {
      toast({ title: "Error", description: "Delete failed" });
    }
  }

  const TABS = ["all", "beverage", "appetizer", "special", "main", "dessert"];

  /* ===========================================================
     EDIT SAVE handler (keeps behavior from your original)
     =========================================================== */
  async function saveEdit() {
    if (!editingItem) return;
    const payload = {
      name: editingItem.name,
      description: editingItem.description,
      price: editingItem.price,
      category: editingItem.category,
      image: editingItem.image,
      vegetarian: editingItem.vegetarian,
      vegan: editingItem.vegan,
      glutenFree: editingItem.glutenFree,
      spicy: editingItem.spicy,
      popular: editingItem.popular,
      available: editingItem.available,
      prepTime: editingItem.prepTime,
      calories: editingItem.calories,
      ingredients: editingItem.ingredients,
      allergens: editingItem.allergens,
      cost: editingItem.cost,
      profit: editingItem.profit,
    };

    try {
      const res = await fetch(`/api/menuItem/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Updated",
          description: "Menu updated successfully.",
        });

        setMenuItems((prev) =>
          prev.map((it) => (it.id === editingItem.id ? { ...it, ...payload } : it))
        );

        setIsModalOpen(false);
      } else {
        const txt = await res.text();
        console.error("Update failed", txt);
        toast({
          title: "Error",
          description: "Update failed",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Update failed",
      });
    }
  }

  /* ===========================================================
     Render
     =========================================================== */
  return (
    <div className="p-6 space-y-6">
      <style dangerouslySetInnerHTML={{ __html: extraStyles }} />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menus</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Veg</Label>
            <select
              value={vegFilter}
              onChange={(e) =>
                setVegFilter(e.target.value as "veg" | "nonveg" | "none")
              }
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="none">All</option>
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
            </select>
          </div>

          <Button
            className="bg-orange-600 text-white"
            onClick={() => router.push("/dashboard/menus/add")}
          >
            + Add Menu
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mt-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-full border text-sm transition ${
              activeTab === t
                ? "bg-orange-600 text-white border-orange-600 shadow-md"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {t === "all" ? "All" : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* GRID / MASONRY / SKELETON */}
      {loading && skeletonLoading ? (
        // skeleton shimmer in masonry layout
        <div className="masonry mt-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="masonry-item rounded-lg overflow-hidden">
              <div className="w-full h-56 skeleton rounded-md" />
              <div className="p-3 space-y-2">
                <div className="h-4 skeleton rounded w-1/2" />
                <div className="h-3 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <motion.div
            className="masonry mt-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filtered.map((item, i) => {
                const variants = cardMotion(i + (item.id?.length ?? 0));
                return (
                  <motion.div
                    key={item.id}
                    className="masonry-item"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    layout
                  >
                    <Card className="overflow-hidden relative transform transition card-glass card-shine group">
                      {/* IMAGE */}
                      <div className="relative w-full" style={{ breakInside: "avoid" }}>
                        <div style={{ position: "relative", width: "100%", paddingBottom: "62%" }}>
                          <Image
                            src={item.image || PLACEHOLDER}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* DROPDOWN (shadcn DropdownMenu) */}
                      <div className="absolute top-4 right-4 z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="bg-white p-1 rounded-full border shadow-sm" aria-label="more">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditingItem(item);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2 inline" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={() => handleDelete(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2 inline" /> Delete
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={() => router.push(`/dashboard/reviews/add?menuItemId=${item.id}`)}
                              className="border-t"
                            >
                              <MessageSquarePlus className="w-4 h-4 mr-2 inline" /> Add Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* CONTENT */}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="pr-3">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <CardDescription className="line-clamp-2 text-sm text-gray-300">
                              {item.description}
                            </CardDescription>
                          </div>

                          {/* RATING */}
                          <div className="flex flex-col items-end ml-2">
                            <span className="font-medium text-sm text-white">
                              {(item.rating ?? 0).toFixed(1)}
                            </span>
                            {renderStars(item.rating)}
                            <span className="text-xs text-gray-400">
                              {item.reviews} reviews
                            </span>
                          </div>
                        </div>

                        {/* BADGES */}
                        <div className="flex gap-2 flex-wrap mt-3 text-xs">
                          <Badge
                            className={`${getCategoryBadgeClass(item.category)} px-2 py-1 rounded-full text-xs`}
                          >
                            {item.category}
                          </Badge>

                          <Badge
                            className={
                              item.vegetarian
                                ? `${getExtraBadgeClass("veg")} px-2 py-1 rounded-full text-xs`
                                : `${getExtraBadgeClass("nonveg")} px-2 py-1 rounded-full text-xs`
                            }
                          >
                            {item.vegetarian ? "Veg" : "Non-Veg"}
                          </Badge>

                          {item.spicy && (
                            <Badge
                              className={`${getExtraBadgeClass("spicy")} px-2 py-1 rounded-full text-xs`}
                            >
                              Spicy
                            </Badge>
                          )}

                          {item.popular && (
                            <Badge
                              className={`${getExtraBadgeClass("popular")} px-2 py-1 rounded-full text-xs`}
                            >
                              Popular
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="text-sm">
                        <div className="flex justify-between items-center">
                          <p className="text-white">
                            <strong>Price:</strong> ₹{item.price}
                          </p>
                          <p className="text-gray-400">
                            <strong>Prep:</strong> {item.prepTime} mins
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* sentinel for infinite scroll */}
          <div ref={sentinelRef} className="flex justify-center mt-6">
            {hasMore ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-400">No more items</div>
            )}
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="bg-black/40 absolute inset-0"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl space-y-4 z-20"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit {editingItem.name}</h2>
                <button
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full flex justify-center">
                  <Image
                    src={editingItem.image || PLACEHOLDER}
                    alt="Preview"
                    width={320}
                    height={240}
                    className="rounded-md object-cover shadow"
                  />
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Name"
                    value={editingItem.name}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Description"
                    value={editingItem.description ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        description: e.target.value,
                      })
                    }
                  />

                  <div>
                    <Label>Category</Label>
                    <select
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, category: e.target.value })
                      }
                      className="w-full border rounded p-2"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c[0].toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  type="number"
                  placeholder="Price"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      price: Number(e.target.value),
                    })
                  }
                />

                <Input
                  type="number"
                  placeholder="Prep Time"
                  value={editingItem.prepTime ?? 0}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      prepTime: Number(e.target.value),
                    })
                  }
                />

                <Input
                  placeholder="Image URL"
                  value={editingItem.image ?? ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, image: e.target.value })
                  }
                />
              </div>

              {/* toggles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem.vegetarian}
                    onCheckedChange={(v) =>
                      setEditingItem({ ...editingItem, vegetarian: Boolean(v) })
                    }
                  />
                  <Label>Vegetarian</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem.spicy}
                    onCheckedChange={(v) =>
                      setEditingItem({ ...editingItem, spicy: Boolean(v) })
                    }
                  />
                  <Label>Spicy</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem.popular}
                    onCheckedChange={(v) =>
                      setEditingItem({ ...editingItem, popular: Boolean(v) })
                    }
                  />
                  <Label>Popular</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem.available}
                    onCheckedChange={(v) =>
                      setEditingItem({ ...editingItem, available: Boolean(v) })
                    }
                  />
                  <Label>Available</Label>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>

                <Button className="bg-orange-600 text-white" onClick={saveEdit}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
