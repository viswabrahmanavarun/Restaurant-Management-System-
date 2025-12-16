"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Search,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  X,
  CreditCard,
  Wallet,
  CheckCircle,
  Eye,
  Clock,
  Star as StarIcon,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

/* ========= Small global typing to avoid TS error for Razorpay ========= */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

/* ===================================================================
    INTERFACES
=================================================================== */
interface Review {
  rating: number;
  comment?: string;
  createdAt?: string;
  customerName?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  prepTime?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  spicy?: boolean;
  popular?: boolean;
  available?: boolean;
  image?: string;
  ingredients?: string[];
  menuReviews?: Review[]; // fetched from API
  rating?: number; // computed
  reviews?: number; // computed
}

/* ===================================================================
    PASTEL BADGE MAPPING (same as Dashboard)
=================================================================== */
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
  const key = String(cat).toLowerCase();
  return CATEGORY_BADGES[key] ?? "bg-gray-100 text-gray-800";
}

function getExtraBadgeClass(type: "veg" | "nonveg" | "spicy" | "popular") {
  return EXTRA_BADGES[type] ?? "bg-gray-100 text-gray-800";
}

/* ===================================================================
    MAIN PAGE
=================================================================== */
export default function PublicMenuPage() {
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeFilter, setActiveFilter] = useState<"" | "veg" | "nonveg">("");

  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  const [payment, setPayment] = useState<"CARD" | "COD">("CARD");

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const [detailsItem, setDetailsItem] = useState<MenuItem | null>(null);

  /* ===================================================================
      ADD TO CART
  =================================================================== */
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.item.id === item.id);
      if (exists) {
        return prev.map((p) => (p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const increaseQty = (id: string) => {
    setCart((prev) => prev.map((p) => (p.item.id === id ? { ...p, qty: p.qty + 1 } : p)));
  };

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((p) => (p.item.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  };

  /* ===================================================================
      TOTALS
  =================================================================== */
  const subtotal = cart.reduce((a, c) => a + c.item.price * c.qty, 0);
  const total = Math.max(subtotal - discount, 0);

  /* ===================================================================
      COUPON LOGIC
  =================================================================== */
  const applyCoupon = () => {
    let d = 0;
    const code = coupon?.trim().toUpperCase();
    if (!code) d = 0;
    else if (code === "SAVE10") d = subtotal * 0.1;
    else if (code === "SAVE50") d = 50;
    setDiscount(Number(d.toFixed(2)));
    setCouponApplied(d > 0);
  };

  /* ===================================================================
      FETCH MENU (INCLUDING reviews)
      Ensure the API returns menuReviews for each item.
      We compute rating (avg) and reviews (count) here.
  =================================================================== */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/menuItem")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        // API may return { items: [...] } or an array directly
        const list: MenuItem[] = (data.items ?? data) as MenuItem[];

        const normalized = (Array.isArray(list) ? list : []).map((it) => {
          const rawReviews = Array.isArray(it.menuReviews) ? it.menuReviews : [];
          const reviewsCount = rawReviews.length;
          const avg =
            reviewsCount > 0
              ? rawReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviewsCount
              : 0;

          const ingredientsArr = Array.isArray(it.ingredients)
            ? it.ingredients
            : it.ingredients
            ? String(it.ingredients)
                .split(",")
                .map((s) => s.trim())
            : [];

          return {
            ...it,
            ingredients: ingredientsArr,
            menuReviews: rawReviews,
            rating: Number(avg.toFixed(1)),
            reviews: reviewsCount,
          };
        });

        setMenuItems(normalized);
      })
      .catch((err) => {
        console.error("Error fetching menu:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean))),
    ],
    [menuItems]
  );

  /* ===================================================================
      FILTER & SEARCH
  =================================================================== */
  const filteredAllItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return menuItems.filter((i) => {
      const matchesSearch =
        !q ||
        i.name.toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        (i.ingredients || []).some((ing) => String(ing).toLowerCase().includes(q));

      if (activeFilter === "veg") return matchesSearch && !!i.vegetarian;
      if (activeFilter === "nonveg") return matchesSearch && !i.vegetarian;
      return matchesSearch;
    });
  }, [menuItems, searchTerm, activeFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    categories.forEach((cat) => {
      groups[cat] =
        cat === "All"
          ? filteredAllItems
          : filteredAllItems.filter(
              (i) => (i.category || "").toLowerCase() === (cat || "").toLowerCase()
            );
    });
    return groups;
  }, [categories, filteredAllItems]);

  /* ===================================================================
      LOAD RAZORPAY
  =================================================================== */
  useEffect(() => {
    const id = "razorpay-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ===================================================================
      PLACE ORDER / CONFIRM PAYMENT
  =================================================================== */
  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!customerName || !customerPhone || !tableNumber)
      return alert("Please enter name, phone and table number");

    setPlacingOrder(true);
    try {
      const payload = {
        cart,
        subtotal,
        discount,
        total,
        customerName,
        customerPhone,
        tableNumber,
        paymentMethod: payment,
      };

      const res = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json();

      if (!res.ok) {
        alert("Payment init failed");
        setPlacingOrder(false);
        return;
      }

      if (j.cod) {
        setOrderResult({
          orderId: j.createdOrderId,
          total,
          items: cart.map((c) => ({ itemName: c.item.name, quantity: c.qty, price: c.item.price })),
        });
        setShowOrderSuccess(true);
        resetCartUI();
        return;
      }

      const { razorpayOrderId, amount, orderId: createdOrderId } = j;

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency: "INR",
        name: "Your Restaurant",
        description: `Order #${createdOrderId}`,
        order_id: razorpayOrderId,
        prefill: { name: customerName, contact: customerPhone },
        handler: async (response: any) => {
          await confirmPayment(response, createdOrderId);
        },
        modal: { ondismiss: () => setPlacingOrder(false) },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Error placing order");
      setPlacingOrder(false);
    }
  };

  const confirmPayment = async (resp: any, createdOrderId: string) => {
    try {
      const res = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdOrderId,
          razorpayPaymentId: resp.razorpay_payment_id,
          razorpayOrderId: resp.razorpay_order_id,
          razorpaySignature: resp.razorpay_signature,
          cart,
          customerName,
          customerPhone,
          tableNumber,
          total,
          paymentMethod: payment,
        }),
      });

      const j = await res.json();
      if (!res.ok) {
        alert("Payment saved but order failed");
        return;
      }

      setOrderResult({
        orderId: j.order.id,
        orderNumber: j.order.orderNumber,
        razorpayPaymentId: resp.razorpay_payment_id,
        total,
        items: cart.map((c) => ({ itemName: c.item.name, quantity: c.qty, price: c.item.price })),
      });

      setShowOrderSuccess(true);
      resetCartUI();
    } catch (err) {
      console.error("Error confirming payment:", err);
      alert("Error confirming payment");
    }
  };

  const resetCartUI = () => {
    setCart([]);
    setDrawerOpen(false);
    setCustomerName("");
    setCustomerPhone("");
    setTableNumber("");
    setCoupon("");
    setDiscount(0);
    setCouponApplied(false);
    setPlacingOrder(false);
  };

  /* ===================================================================
      ANIMATIONS
  =================================================================== */
  const cardVariant = {
    hidden: { opacity: 0, y: 12, scale: 0.995 },
    enter: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.995 },
  };

  const modalVariant = { hidden: { opacity: 0, scale: 0.98 }, enter: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 } };
  const successVariant = { hidden: { opacity: 0, y: -8 }, enter: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

  /* ===================================================================
      STAR RENDER (used on card + modal)
  ==================================================================== */
  function renderStars(rating = 0) {
    const full = Math.round(rating); // nearest integer for filled stars
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon key={n} className={`w-4 h-4 ${n <= full ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    );
  }

  /* ===================================================================
      RENDER PAGE
  ==================================================================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white relative">
      <header className="bg-white sticky top-0 z-40 border-b px-6 py-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-2xl font-bold">Public Menu</h1>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative max-w-md w-full md:w-[420px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rounded-xl shadow-sm" />
          </div>
        </div>
      </header>

      <div className="w-full px-6 mt-4">
        <Tabs defaultValue="All">
          <TabsList className="flex w-full bg-white border-b py-2 px-2 rounded-xl shadow-sm gap-2">
            {categories.map((cat) => {
              const label = String(cat).trim();
              const display = label.charAt(0).toUpperCase() + label.slice(1);
              return (
                <TabsTrigger key={cat} value={cat} className="flex-1 text-center px-4 py-2 rounded-lg transition data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                  {display}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex justify-end mt-4 pr-1">
            <VegNonVegToggle active={activeFilter} onToggle={setActiveFilter} />
          </div>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <h2 className="text-3xl font-bold mt-6 mb-2">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 pb-8">
                <AnimatePresence>
                  {groupedItems[cat]?.map((item) => (
                    <motion.div key={item.id} variants={cardVariant} initial="hidden" animate="enter" exit="exit" layout>
                      <MenuCard item={item} onOpenDetails={() => setDetailsItem(item)} onAdd={() => { addToCart(item); setDrawerOpen(true); }} renderStars={renderStars} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {cart.length > 0 && (
        <button onClick={() => setDrawerOpen(true)} className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-xl z-50 hover:scale-105 transition">
          <ShoppingCart className="h-6 w-6" />
        </button>
      )}

      <AnimatePresence>
        {detailsItem && (
          <motion.div key="details-modal" initial="hidden" animate="enter" exit="exit" variants={modalVariant} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailsItem(null)} />
            <motion.div variants={modalVariant} className="relative w-full max-w-3xl">
              <DetailsModal
                item={detailsItem}
                onClose={() => setDetailsItem(null)}
                onAdd={(it: MenuItem) => {
                  addToCart(it);
                  setDetailsItem(null);
                  setDrawerOpen(true);
                }}
                renderStars={renderStars}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer
        cart={cart}
        drawerOpen={drawerOpen}
        decreaseQty={decreaseQty}
        increaseQty={increaseQty}
        setDrawerOpen={setDrawerOpen}
        customerName={customerName}
        customerPhone={customerPhone}
        tableNumber={tableNumber}
        setCustomerName={setCustomerName}
        setCustomerPhone={setCustomerPhone}
        setTableNumber={setTableNumber}
        payment={payment}
        setPayment={setPayment}
        coupon={coupon}
        subtotal={subtotal}
        total={total}
        setCoupon={setCoupon}
        applyCoupon={applyCoupon}
        couponApplied={couponApplied}
        discount={discount}
        placeOrder={placeOrder}
        placingOrder={placingOrder}
      />

      <AnimatePresence>
        {showOrderSuccess && orderResult && (
          <motion.div key="success-modal" initial="hidden" animate="enter" exit="exit" variants={successVariant}>
            <SuccessModal orderResult={orderResult} setShowOrderSuccess={setShowOrderSuccess} setOrderResult={setOrderResult} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================================================================
    VEG/NON-VEG TOGGLE
=================================================================== */
function VegNonVegToggle({ active, onToggle }: { active: "" | "veg" | "nonveg"; onToggle: (v: "" | "veg" | "nonveg") => void }) {
  return (
    <div className="flex bg-white border rounded-full shadow-sm overflow-hidden">
      <button onClick={() => onToggle(active === "veg" ? "" : "veg")} className={`px-4 py-2 text-sm font-semibold transition ${active === "veg" ? "bg-green-600 text-white" : "bg-white text-green-700"}`}>
        Veg
      </button>
      <button onClick={() => onToggle(active === "nonveg" ? "" : "nonveg")} className={`px-4 py-2 text-sm font-semibold transition ${active === "nonveg" ? "bg-red-600 text-white" : "bg-white text-red-700"}`}>
        Non-Veg
      </button>
    </div>
  );
}

/* ===================================================================
    MENU CARD
=================================================================== */
function MenuCard({ item, onOpenDetails, onAdd, renderStars }: any) {
  return (
    <Card className="overflow-hidden rounded-xl hover:shadow-2xl transition hover:scale-[1.02]">
      <div className="relative h-48 bg-gray-100 group">
        <Image src={item.image?.startsWith("http") ? item.image : "/placeholder.svg"} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />

        {/* Category badge (pastel) */}
        {item.category && (
          <Badge className={`absolute top-3 left-3 ${getCategoryBadgeClass(item.category)} px-2 py-1 rounded-full text-xs`}>
            {item.category}
          </Badge>
        )}

        {/* Popular / Spicy */}
        {item.popular && <Badge className={`absolute top-3 left-3 ml-0 mt-8 ${getExtraBadgeClass("popular")} px-2 py-1 rounded-full text-xs`}>Popular</Badge>}
        {item.spicy && <Badge className="absolute top-3 right-3 bg-red-600 text-white">Spicy</Badge>}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-end p-4">
          <button onClick={() => onOpenDetails(item)} className="bg-white/90 px-4 py-2 rounded-lg shadow opacity-0 group-hover:opacity-100 transition">
            <Eye className="w-4 h-4 inline mr-2" />
            View Details
          </button>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{item.name}</span>

          {/* Rating display on the card */}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{(item.rating ?? 0).toFixed(1)}</span>
              <div className="flex items-center">{renderStars(item.rating ?? 0)}</div>
            </div>
            <div className="text-xs text-gray-500">{(item.reviews ?? 0) + " reviews"}</div>
          </div>
        </CardTitle>

        <CardDescription className="line-clamp-2">{item.description}</CardDescription>

        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge className={item.vegetarian ? `${getExtraBadgeClass("veg")} px-2 py-1 rounded-full text-xs` : `${getExtraBadgeClass("nonveg")} px-2 py-1 rounded-full text-xs`}>
            {item.vegetarian ? "Veg" : "Non-Veg"}
          </Badge>

          {item.vegan && <Badge className="bg-emerald-100 px-2 py-1 rounded-full text-xs">Vegan</Badge>}
          {item.glutenFree && <Badge className="bg-teal-100 px-2 py-1 rounded-full text-xs text-teal-900">Gluten Free</Badge>}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-lg font-bold text-orange-600">₹{item.price}</p>
        {item.prepTime && (
          <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Clock className="w-4 h-4" />
            {item.prepTime} min
          </p>
        )}
        <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-3" onClick={() => onAdd(item)}>
          Add to Order
        </Button>
      </CardContent>
    </Card>
  );
}

/* ===================================================================
    DETAILS MODAL — FULLY UPDATED WITH REVIEWS + RATING FILTER
=================================================================== */
function DetailsModal({ item, onClose, onAdd, renderStars }: any) {
  // ratingFilter: 'ALL' or '5'|'4'|'3'|'2'|'1' meaning show reviews with rating >= value
  const [ratingFilter, setRatingFilter] = useState<"ALL" | "5" | "4" | "3" | "2" | "1">("ALL");

  const reviews: Review[] = Array.isArray(item?.menuReviews) ? item.menuReviews : [];

  const filteredReviews = useMemo(() => {
  if (ratingFilter === "ALL") return reviews;
  const exact = Number(ratingFilter);
  return reviews.filter((r) => Number(r.rating) === exact);
}, [reviews, ratingFilter]);


  return (
    <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col md:flex-row">
        {/* IMAGE */}
        <div className="relative w-full md:w-1/2 h-64">
          <Image
            src={item.image?.startsWith("http") ? item.image : "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-6 w-full md:w-1/2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-bold">{item.name}</h3>

            {/* Rating */}
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {(item.rating ?? 0).toFixed(1)}
                </span>
                {renderStars(item.rating ?? 0)}
              </div>
              <div className="text-xs text-gray-500">
                {(item.reviews ?? 0) + " reviews"}
              </div>
            </div>
          </div>

          <p className="text-gray-600 mt-1">{item.description}</p>
          <p className="text-xl font-bold text-orange-600 mt-3">₹{item.price}</p>

          <div className="mt-4 flex gap-2 flex-wrap">
            {/* Category */}
            {item.category && (
              <Badge
                className={`${getCategoryBadgeClass(
                  item.category
                )} px-2 py-1 rounded-full text-xs`}
              >
                {item.category}
              </Badge>
            )}

            {/* Veg / Non-Veg */}
            <Badge
              className={
                item.vegetarian
                  ? `${getExtraBadgeClass("veg")} px-2 py-1 rounded-full text-xs`
                  : `${getExtraBadgeClass("nonveg")} px-2 py-1 rounded-full text-xs`
              }
            >
              {item.vegetarian ? "Veg" : "Non-Veg"}
            </Badge>

            {item.vegan && (
              <Badge className="bg-emerald-100 px-2 py-1 rounded-full text-xs">
                Vegan
              </Badge>
            )}

            {item.glutenFree && (
              <Badge className="bg-teal-100 px-2 py-1 rounded-full text-xs text-teal-900">
                Gluten Free
              </Badge>
            )}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Ingredients</h4>
            <ul className="list-disc ml-6 mt-1 text-sm">
              {item.ingredients?.length
                ? item.ingredients.map((ing: string, i: number) => (
                    <li key={i}>{ing}</li>
                  ))
                : "No ingredients listed"}
            </ul>
          </div>
          

          {/* ACTION BUTTONS + RATING FILTER */}
          <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* LEFT — Rating Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="rating-filter" className="text-sm font-medium text-gray-700">
                Rating
              </label>
              <select
                id="rating-filter"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-lg bg-white"
              >
                <option value="ALL">All</option>
                <option value="5">5 ⭐</option>
                <option value="4">4 ⭐</option>
                <option value="3">3 ⭐</option>
                <option value="2">2 ⭐</option>
                <option value="1">1 ⭐</option>
              </select>
            </div>

            {/* RIGHT — Add + Close */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button className="flex-1 bg-orange-600" onClick={() => onAdd(item)}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Order
              </Button>

            </div>
          </div>
        </div>
      </div>

      {/* ================================
            ⭐ CUSTOMER REVIEWS ⭐
      ================================= */}
      <div className="p-6 border-t">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          Customer Reviews
          <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        </h3>


        {filteredReviews?.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((rev: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                {/* Name & Date */}
                <div className="flex justify-between mb-2">
                  <p className="font-semibold text-gray-900">
                    {rev.customerName || "Customer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rev.createdAt ? new Date(rev.createdAt).toDateString() : ""}
                  </p>
                </div>

                {/* Comment */}
                <p className="text-gray-700 text-sm mb-2">{rev.comment}</p>

                {/* Rating */}
                <div className="flex items-center">{renderStars(rev.rating)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No published reviews for the selected rating.</p>
        )}
      </div>
    </div>
  );
}

/* ===================================================================
    CART DRAWER
=================================================================== */
function CartDrawer(props: any) {
  const {
    cart,
    drawerOpen,
    setDrawerOpen,
    decreaseQty,
    increaseQty,
    customerName,
    customerPhone,
    tableNumber,
    setCustomerName,
    setCustomerPhone,
    setTableNumber,
    payment,
    setPayment,
    coupon,
    setCoupon,
    couponApplied,
    subtotal,
    discount,
    total,
    applyCoupon,
    placeOrder,
    placingOrder,
  } = props;

  return (
    <div className={`fixed top-0 right-0 h-full w-full md:w-[45%] bg-white shadow-2xl z-50 transition-transform duration-500 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Your Order</h2>
        <X className="w-6 h-6 cursor-pointer" onClick={() => setDrawerOpen(false)} />
      </div>

      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Your Details</h3>
        <div className="space-y-3">
          <Input placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <Input placeholder="Phone (10 digits)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          <Input placeholder="Table Number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
        </div>
      </div>

      <div className="p-4 h-[30%] overflow-y-auto border-b">
        {cart.map((c: any) => (
          <div key={c.item.id} className="flex gap-4 border-b py-4">
            <Image src={c.item.image?.startsWith("http") ? c.item.image : "/placeholder.svg"} width={80} height={80} className="rounded-lg object-cover" alt={c.item.name} />
            <div className="flex-1">
              <p className="font-semibold">{c.item.name}</p>
              <p className="text-gray-600 text-sm">₹{c.item.price}</p>
              <div className="flex gap-3 mt-2 items-center">
                <Button size="icon" variant="outline" onClick={() => decreaseQty(c.item.id)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-lg">{c.qty}</span>
                <Button size="icon" variant="outline" onClick={() => increaseQty(c.item.id)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {couponApplied && (
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Input placeholder="Enter coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <Button className="bg-orange-600" onClick={applyCoupon}>
            Apply
          </Button>
        </div>
        <div className="flex justify-between mt-4 text-xl font-bold">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex gap-3 items-center p-3 border rounded-xl cursor-pointer">
            <input type="radio" name="payment" value="CARD" checked={payment === "CARD"} onChange={() => setPayment("CARD")} />
            <CreditCard className="w-6 h-6 text-blue-600" />
            Online Payment (Card / UPI)
          </label>
          <label className="flex gap-3 items-center p-3 border rounded-xl cursor-pointer">
            <input type="radio" name="payment" value="COD" checked={payment === "COD"} onChange={() => setPayment("COD")} />
            <Wallet className="w-6 h-6 text-orange-600" />
            Cash
          </label>
        </div>
      </div>

      <div className="p-4">
        <Button className="w-full bg-orange-600 text-white p-4 rounded-xl" onClick={placeOrder} disabled={placingOrder}>
          {placingOrder ? "Placing order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}

/* ===================================================================
    SUCCESS MODAL
=================================================================== */
function SuccessModal({ orderResult, setShowOrderSuccess, setOrderResult }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 flex items-center gap-4">
          <div className="bg-white p-3 rounded-full">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <div className="text-white">
            <h3 className="text-2xl font-bold">Order Confirmed</h3>
          </div>

          <div className="ml-auto text-white">
            <div className="text-sm">Order</div>
            <div className="font-bold">{orderResult?.orderNumber || orderResult?.orderId}</div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Payment ID</p>
              <p className="font-medium">{orderResult?.razorpayPaymentId || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Total Paid</p>
              <p className="font-medium">₹{(orderResult?.total || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Items</h4>
            <div className="max-h-40 overflow-y-auto mt-3 space-y-2">
              {orderResult?.items?.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    <div className="font-medium">{it.itemName}</div>
                    <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                  </div>
                  <div className="text-gray-600">₹{(it.price || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              className="flex-1 bg-orange-600 text-white"
              onClick={() => {
                setShowOrderSuccess(false);
                setOrderResult(null);
              }}
            >
              Done
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const text = `Order: ${orderResult?.orderNumber || orderResult?.orderId}\nPayment: ${orderResult?.razorpayPaymentId}\nTotal: ₹${(orderResult?.total || 0).toFixed(2)}`;
                navigator.clipboard.writeText(text);
                alert("Order summary copied");
              }}
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
