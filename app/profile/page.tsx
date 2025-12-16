"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName") || "";
    const userEmail = localStorage.getItem("userEmail") || "";

    if (!userId) {
      setError("User ID not found. Please login again.");
      setLoading(false);
      return;
    }

    // ⭐ FALLBACK USERS (hardcoded)
    if (userId === "hardcoded-user") {
      setUser({
        name: userName || userRole?.toUpperCase(),
        email: userEmail || "not-added@example.com",
        role: userRole || "unknown",
        phone: "Not added",
        gender: "Not added",
        address: "Not added",
        staffId: "N/A",
        image: "",
      });
      setLoading(false);
      return;
    }

    // ⭐ DATABASE USERS
    async function loadProfile() {
      try {
        const res = await fetch(`/api/profile?userId=${userId}`);
        const data = await res.json();

        if (!res.ok || !data.user) {
          setError("Profile not found.");
          setLoading(false);
          return;
        }

        setUser(data.user);
        setLoading(false);
      } catch (err) {
        setError("Failed to load profile.");
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading)
    return (
      <p className="p-6 text-gray-600 text-lg font-medium">
        Loading profile...
      </p>
    );

  if (error)
    return (
      <p className="p-6 text-red-600 text-lg font-semibold">
        {error}
      </p>
    );

  if (!user)
    return (
      <p className="p-6 text-red-600 text-lg">
        No user data found.
      </p>
    );

  return (
    <div className="min-h-screen bg-[#FFF4E6] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-xl border border-orange-200">

        {/* BACK BUTTON */}
        <Link href="/dashboard" className="inline-flex items-center mb-6">
          <Button
            variant="default"
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 px-4 py-2"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </Link>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          My Profile
        </h1>

        {/* PROFILE CARD */}
        <div className="flex flex-col items-center">
          <img
            src={
              user.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=ff8a00&color=fff`
            }
            className="w-32 h-32 rounded-full object-cover shadow-md border-2 border-orange-400"
          />

          <h2 className="text-2xl font-semibold mt-4">{user.name}</h2>

          <span className="px-4 py-1 mt-2 bg-black text-white rounded-full text-sm capitalize shadow">
            {user.role}
          </span>
        </div>

        {/* DETAILS */}
        <div className="mt-8 space-y-3 text-gray-800 text-lg">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone || "Not added"}</p>
          <p><strong>Gender:</strong> {user.gender || "Not specified"}</p>
          <p><strong>Address:</strong> {user.address || "Not added"}</p>
          <p><strong>Staff ID:</strong> {user.staffId || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
