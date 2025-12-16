"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Users,
  Award,
  Utensils,
  ChevronRight,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRestaurant, RestaurantDetails } from "@/context/RestaurantContext";
import ReservationModal from "@/components/ReservationModal";

// SWIPER
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

/* ============================================================================================
   PREMIUM BACKGROUND
============================================================================================ */

function PremiumBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-[1] pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "url('https://i.imgur.com/dZlPj8F.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

/* ============================================================================================
   DEFAULT DATA
============================================================================================ */

const defaultRestaurant: Partial<
  RestaurantDetails & { heroImages?: string[] }
> = {
  name: "Bella Vista",
  logo: "/default-logo.png",
  address: "123, MG Road, Koramangala, Bengaluru",
  contact: "+91 98765 43210",
  email: "bellavista@gmail.com",
  operatingHours: "10:00 AM - 1:00 AM",
};

/* ============================================================================================
   HERO IMAGES
============================================================================================ */

const heroImages = [
  "https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg",
  "https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=1920",
  "https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg",
  "https://images.pexels.com/photos/1410236/pexels-photo-1410236.jpeg",
];

/* ============================================================================================
   MENU ITEMS
============================================================================================ */

const menuItems = [
  {
    name: "Spicy Penne Pasta",
    description: "Rich, creamy pasta with Italian spices.",
    price: "₹220",
    image:
      "https://s.lightorangebean.com/media/20240914160809/Spicy-Penne-Pasta_-done.png",
    category: "Main Course",
  },
  {
    name: "Paneer Fried Rice",
    description: "Indo-Chinese stir-fried rice with fresh paneer.",
    price: "₹150",
    image:
      "https://www.kannammacooks.com/wp-content/uploads/paneer-fried-rice-recipe-1-5.jpg",
    category: "Main Course",
  },
  {
    name: "Gulab Jamun",
    description: "Soft, warm dessert soaked in sweet syrup.",
    price: "₹80",
    image:
      "https://sharmanjainsweets.com/cdn/shop/articles/Untitled_design_eb07557c-e535-4bdf-9063-8a1f1cffa58c.png?v=1751535882",
    category: "Dessert",
  },
];

/* ============================================================================================
   FOOD CATEGORY SLIDER DATA
============================================================================================ */

const foodCategories = [
  { name: "Biryani", image: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Chicken-Biryani-Recipe.jpg" },
  { name: "Shawarma", image: "https://foxeslovelemons.com/wp-content/uploads/2023/06/Chicken-Shawarma-8.jpg" },
  { name: "Pizza", image: "https://www.tasteofhome.com/wp-content/uploads/2018/01/Homemade-Pizza_EXPS_FT23_376_EC_120123_3.jpg" },
  { name: "Noodles", image: "https://www.ohmyveg.co.uk/wp-content/uploads/2024/08/hakka-noodles.jpg" },
  { name: "Rolls", image: "https://www.spiceupthecurry.com/wp-content/uploads/2015/05/paneer-kathi-roll-1.jpg" },
  { name: "Samosa", image: "https://vegecravings.com/wp-content/uploads/2017/03/Aloo-Samosa-Recipe-Step-By-Step-Instructions.jpg" },
  { name: "Burger", image: "https://img.freepik.com/premium-psd/hamburger-with-cheese-vegetables-splash_999419-6295.jpg?semt=ais_hybrid&w=740&q=80" },
  { name: "Cake", image: "https://img.freepik.com/free-psd/decadent-chocolate-cake-symphony-brown_632498-24549.jpg?semt=ais_hybrid&w=740&q=80" },
  { name: "Shake", image: "https://www.funfoodfrolic.com/wp-content/uploads/2021/05/Mango-Shake-Thumbnail.jpg" },
  { name: "Pastry", image: "https://theobroma.in/cdn/shop/files/EgglessRichChocolatePastry.jpg?v=1750341628" },
  { name: "Kachori", image: "data:image/jpeg;base64,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" },
  { name: "Poori", image: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/Receipes/chole_poori.webp" },
  { name: "Pav Bhaji", image: "https://pipingpotcurry.com/wp-content/uploads/2025/05/Pav-Bhaji-Instant-Pot-PipingPotCurry.jpg" },
  { name: "Parotta", image: "https://www.whiskaffair.com/wp-content/uploads/2020/04/Kerala-Parotta-3.jpg" },
];

/* ============================================================================================
   RATING STARS
============================================================================================ */

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

/* ============================================================================================
   MAIN PAGE
============================================================================================ */

export default function LandingPage() {
  const { restaurantDetails } = useRestaurant();
  const [openModal, setOpenModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (data.success) {
          setReviews(
            data.reviews.filter(
              (r: any) => r.status === "PUBLISHED" && r.showOnHome === true
            )
          );
        }
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, []);

  const r = {
    name: restaurantDetails?.name || defaultRestaurant.name!,
    logo: restaurantDetails?.logo || defaultRestaurant.logo!,
    address: restaurantDetails?.address || defaultRestaurant.address!,
    contact: restaurantDetails?.contact || defaultRestaurant.contact!,
    email: restaurantDetails?.email || defaultRestaurant.email!,
    operatingHours:
      restaurantDetails?.operatingHours || defaultRestaurant.operatingHours!,
  } as RestaurantDetails;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(to bottom, #fff7f0, #fff2e6)" }}
    >
      <PremiumBackground />

      {/* ============================================================================================
          HEADER
      ============================================================================================ */}
      <header className="bg-white/60 backdrop-blur-xl shadow-sm sticky top-0 z-[60]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <ChefHat className="text-orange-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{r.name}</h1>
              <p className="text-xs text-gray-500">Finest dining experience</p>
            </div>
          </div>

          <nav className="hidden md:flex gap-8 text-gray-700">
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#reviews">Reviews</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/menu">Explore</Link>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => setOpenModal(true)}
            >
              Reserve
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Staff</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ============================================================================================
          HERO SLIDER
      ============================================================================================ */}
      <section className="relative w-full h-[65vh] md:h-[75vh] mt-2 z-[50] overflow-hidden rounded-xl">
        <Swiper
          modules={[Pagination, Navigation, Autoplay, EffectFade]}
          effect="fade"
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          autoplay={{ delay: 3800 }}
          loop
          className="w-full h-full"
        >
          {heroImages.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={img}
                  alt="Restaurant Hero"
                  fill
                  priority
                  className="object-cover scale-110 hero-parallax"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

                <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                  <div className="max-w-3xl text-white">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-xl">
                      Discover Delicious Moments
                    </h2>
                    <p className="mt-4 text-lg md:text-xl text-white/90">
                      Fresh ingredients · Expert chefs · Premium taste
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/menu">
                        <button className="px-6 py-3 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg">
                          Explore Menu
                        </button>
                      </Link>

                      <button
                        onClick={() => setOpenModal(true)}
                        className="px-6 py-3 rounded-md border border-white/40 bg-white/10 text-white font-semibold shadow-lg"
                      >
                        Reserve Table
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style jsx>{`
          .hero-parallax {
            animation: zoomSlow 12s ease-in-out infinite;
          }

          @keyframes zoomSlow {
            0% {
              transform: scale(1.08);
            }
            50% {
              transform: scale(1.18);
            }
            100% {
              transform: scale(1.08);
            }
          }
        `}</style>
      </section>

      {/* ============================================================================================
          FOOD CATEGORY SLIDER (NEW!)
      ============================================================================================ */}
      <section className="py-14 bg-transparent relative z-[3]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Order our best food options</h2>

          <div className="relative">
            {/* Left Arrow */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => {
                document.getElementById("foodScroll")?.scrollBy({
                  left: -300,
                  behavior: "smooth",
                });
              }}
            >
              <ChevronRight className="rotate-180 text-gray-700" />
            </button>

            {/* Scroll Container */}
            <div
              id="foodScroll"
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-4"
            >
              {foodCategories.map((item, index) => (
                <div key={index} className="flex flex-col items-center min-w-[120px]">
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <p className="text-center mt-3 font-medium text-gray-700">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => {
                document.getElementById("foodScroll")?.scrollBy({
                  left: 300,
                  behavior: "smooth",
                });
              }}
            >
              <ChevronRight className="text-gray-700" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================================================
          FEATURES
      ============================================================================================ */}
      <section className="py-20 relative z-[3]">
        <div className="container mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          {[ 
            { icon: <ChefHat />, title: "Expert Chefs" },
            { icon: <Utensils />, title: "Fresh Ingredients" },
            { icon: <Users />, title: "Perfect Service" },
            { icon: <Award />, title: "Award Winning" },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-gray-600 mt-2">
                Exceptional quality & attention to detail
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================================================
          FEATURED DISHES
      ============================================================================================ */}
      <section id="menu" className="py-20 relative z-[3] bg-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Featured Dishes</h2>
            <p className="text-gray-600 mt-2">Taste the best we offer</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
              >
                <div className="relative h-56">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-orange-600">
                    {item.category}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-gray-600 mt-2">{item.description}</p>
                  <p className="text-2xl text-orange-600 font-bold mt-3">
                    {item.price}
                  </p>
                </CardContent>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700" asChild>
              <Link href="/menu">
                View Full Menu <ChevronRight className="inline-block ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================================================
          REVIEWS
      ============================================================================================ */}
      <section id="reviews" className="py-20 relative z-[3]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold">What our guests are saying</h2>
            <p className="text-gray-600 mt-2">
              Real reviews from customers who loved our food
            </p>
          </div>

          {loadingReviews ? (
            <p className="text-center text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-500">No reviews yet.</p>
          ) : (
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              autoplay={{ delay: 3500 }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {reviews.map((rev: any) => (
                <SwiperSlide key={rev.id}>
                  <div className="bg-white rounded-xl shadow-xl p-6 border flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{rev.customerName}</h3>
                      <p className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toDateString()}
                      </p>
                    </div>

                    <p className="text-gray-700 text-sm mt-1">
                      {rev.comment}
                    </p>

                    <RatingStars rating={rev.rating} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* ============================================================================================
          CONTACT
      ============================================================================================ */}
      <section id="contact" className="py-20 relative z-[3]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Visit Us</h2>
            <p className="text-lg text-gray-600 mt-2">
              We can't wait to welcome you to {r.name}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: (
                  <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                ),
                title: "Location",
                content: r.address,
              },
              {
                icon: (
                  <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                ),
                title: "Hours",
                content: r.operatingHours,
              },
              {
                icon: (
                  <Phone className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                ),
                title: "Contact",
                content: (
                  <>
                    Phone: {r.contact}
                    <br />
                    Email: {r.email}
                  </>
                ),
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl bg-white shadow-xl text-center"
              >
                {item.icon}
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================================================
          FOOTER
      ============================================================================================ */}
      <footer className="bg-white/70 backdrop-blur-md text-gray-900 py-16 shadow-inner">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-4">{r.name}</h3>
            <p className="text-gray-600">
              Crafted dishes · Premium taste · Unforgettable dining
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Quick Links</h4>
            <ul className="text-gray-700 space-y-2">
              <li><a href="#menu">Menu</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Services</h4>
            <ul className="text-gray-700 space-y-2">
              <li>Dine In</li>
              <li>Takeaway</li>
              <li>Catering</li>
              <li>Private Events</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Contact Info</h4>
            <p className="text-gray-700">📞 {r.contact}</p>
            <p className="text-gray-700">📧 {r.email}</p>
            <p className="text-gray-700">📍 {r.address}</p>
          </div>
        </div>

        <div className="text-center text-gray-600 border-t border-gray-300 mt-10 pt-6">
          © {new Date().getFullYear()} {r.name}. All rights reserved.
        </div>
      </footer>

      <ReservationModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}
