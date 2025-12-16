"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface RestaurantDetails {
  name: string;
  logo: string;
  address: string;
  contact: string;
  email: string;
  operatingHours?: string;
}

interface ContextType {
  restaurantDetails: RestaurantDetails;
  setRestaurantDetails: (update: Partial<RestaurantDetails>) => Promise<void>;
  loading: boolean;
}

const RestaurantContext = createContext<ContextType | undefined>(undefined);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [restaurantDetails, setDetails] = useState<RestaurantDetails>({
    name: "",
    logo: "",
    address: "",
    contact: "",
    email: "",
    operatingHours: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.restaurantDetails) {
          setDetails(data.restaurantDetails);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Save/update settings
  const setRestaurantDetails = async (update: Partial<RestaurantDetails>) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantDetails: update }),
      });
      const data = await res.json();
      if (res.ok) {
        setDetails((prev) => ({ ...prev, ...update }));
      } else {
        console.error("Failed to save settings:", data.message);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  return (
    <RestaurantContext.Provider value={{ restaurantDetails, setRestaurantDetails, loading }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
};
