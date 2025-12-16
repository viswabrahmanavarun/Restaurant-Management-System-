"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChefHat, Eye, EyeOff, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRestaurant } from "@/context/RestaurantContext";

// IMPORTANT: Correct toast import
import { useToast } from "@/hooks/use-toast";


export default function LoginPage() {
  const { restaurantDetails } = useRestaurant();
  const router = useRouter();

  const { toast } = useToast(); // correct toast hook

  /* ------------------ DARK MODE ------------------ */
  const [dark, setDark] = useState(false);

  /* ------------------ SLIDESHOW ------------------ */
  const images = [
    "https://images.unsplash.com/photo-1525755662778-989d0524087e",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentImage((prev) => (prev + 1) % images.length),
      3500
    );
    return () => clearInterval(timer);
  }, []);

  /* ------------------ AUTH DATA ------------------ */
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) setEmail(`${role}@bellavista.com`);
  }, [role]);

  const validCredentials = {
    admin: { email: "admin@bellavista.com", password: "Admin@123" },
    manager: { email: "manager@bellavista.com", password: "Manager@123" },
    chef: { email: "chef@bellavista.com", password: "Chef@123" },
    waiter: { email: "waiter@bellavista.com", password: "Waiter@123" },
  };

  async function loginWithDatabase() {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          role: role.toLowerCase(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userRole", data.role);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /* ------------------ LOGIN HANDLER ------------------ */
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const prismaLogin = await loginWithDatabase();
    if (prismaLogin) {
      router.push("/dashboard");
      return;
    }

    const fallback = validCredentials[role];
    if (fallback && fallback.email === email && fallback.password === password) {
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", "hardcoded-user");
      router.push("/dashboard");
      return;
    }

    // SHOW TOAST ON INVALID CREDENTIALS
    toast({
      title: "Invalid Credentials",
      description: "Please check your email, password, and role.",
      variant: "destructive",
    });

    setLoading(false);
  };

  /* ------------------ PARTICLES BG ------------------ */
  const Particles = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-10 left-20 w-20 h-20 bg-orange-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-32 w-32 h-32 bg-yellow-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-red-300 rounded-full opacity-20 blur-xl animate-pulse"></div>
    </div>
  );

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-all ${
        dark ? "bg-gray-900 text-white" : "bg-orange-50 text-black"
      }`}
    >
      <Particles />

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="absolute top-5 right-5 p-3 rounded-full bg-white shadow-lg hover:bg-gray-200 transition"
      >
        {dark ? <Sun /> : <Moon />}
      </button>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
        
        {/* LEFT SLIDE SHOW */}
        <div className="relative hidden md:block w-full h-full">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="Food Slide"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent"></div>

          <div className="absolute bottom-12 left-10 text-white animate-slideUp">
            <h1 className="text-4xl font-extrabold drop-shadow-2xl">
              Taste the Excellence
            </h1>
            <p className="text-lg opacity-90 mt-1">
              Your restaurant. Perfectly managed.
            </p>
          </div>
        </div>

        {/* RIGHT - LOGIN FORM */}
        <div className={`p-10 transition ${dark ? "text-white" : "text-black"}`}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-3 text-3xl font-bold">
              <ChefHat className="h-10 w-10 text-orange-600" />
              <span>{restaurantDetails.name}</span>
            </div>
            <p className="opacity-70 mt-2">Restaurant Management System</p>
          </div>

          <Card className="shadow-xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border-0 rounded-2xl">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-3xl font-extrabold">
                Welcome Back
              </CardTitle>
              <CardDescription>
                Sign in using your role credentials
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">

                {/* ROLE */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Choose role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="chef">Chef</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* SIGN IN BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-lg bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-6 opacity-80">
            <Link href="/" className="hover:text-orange-600">
              ← Back to Restaurant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
