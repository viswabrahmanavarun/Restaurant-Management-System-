"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRestaurant } from "@/context/RestaurantContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreateUserForm from "./components/CreateUserForm";
import StaffSettings from "./components/StaffSettings";

/* ---------------- Helper Inputs ---------------- */
const LabeledInput = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) => (
  <label className="block mb-3">
    <span className="font-medium text-gray-700">{label}</span>
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      className="border border-gray-300 rounded-lg p-2 w-full mt-1 focus:ring-2 focus:ring-orange-400"
    />
  </label>
);

const LabeledTextarea = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <label className="block mb-3">
    <span className="font-medium text-gray-700">{label}</span>
    <textarea
      value={value ?? ""}
      onChange={onChange}
      className="border border-gray-300 rounded-lg p-2 w-full mt-1 focus:ring-2 focus:ring-orange-400"
    />
  </label>
);

/* MAIN PAGE */
export default function SettingsPage() {
  const { setRestaurantDetails } = useRestaurant();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  /* ROLE CHECK */
  const storedRole =
    typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const isAdmin = storedRole?.toLowerCase() === "admin";

  /* Redirect non-admins away from New User tab if URL has newUser */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search.toLowerCase();
      if (!isAdmin && search.includes("newuser")) {
        router.replace("/dashboard/settings");
      }
    }
  }, [isAdmin, router]);

  /* SETTINGS STATE (Prisma) */
  const [restaurantSettings, setRestaurantSettings] = useState<any>({});
  const [tableSettings, setTableSettings] = useState<any>({});
  const [reservationSettings, setReservationSettings] = useState<any>({});
  const [reviewSettings, setReviewSettings] = useState<any>({});

  /* LOAD SETTINGS FROM BACKEND */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();

        setRestaurantSettings(data.restaurantDetails || {});
        setTableSettings(data.tableSettings || {});
        setReservationSettings(data.reservationSettings || {});
        setReviewSettings(data.reviewSettings || {});
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };

    loadSettings();
  }, []);

  /* SAVE SETTINGS */
  const handleSave = async () => {
    const payload = {
      restaurantDetails: restaurantSettings,
      tableSettings,
      reservationSettings,
      reviewSettings,
    };

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Settings saved successfully!");
        setRestaurantDetails(restaurantSettings);
      } else {
        alert("Failed to save settings!");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      alert("Failed to save settings!");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  RENDER PAGE                               */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="p-8 max-w-7xl mx-auto" ref={wrapperRef}>
      <Tabs defaultValue="restaurant" className="space-y-6">
        <TabsList>
          <TabsTrigger value="restaurant">Restaurant Settings</TabsTrigger>
          <TabsTrigger value="staff">Staff Settings</TabsTrigger>
          {isAdmin && <TabsTrigger value="newUser">New User</TabsTrigger>}
        </TabsList>

        {/* ============================ RESTAURANT SETTINGS ============================ */}
        <TabsContent value="restaurant">
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-2xl shadow-lg border border-orange-200 space-y-6">
              <h2 className="text-3xl font-bold text-orange-600">
                Restaurant Details
              </h2>

              <LabeledInput
                label="Name"
                value={restaurantSettings.name}
                onChange={(e) =>
                  setRestaurantSettings({
                    ...restaurantSettings,
                    name: e.target.value,
                  })
                }
              />

              <LabeledInput
                label="Logo URL"
                value={restaurantSettings.logo}
                onChange={(e) =>
                  setRestaurantSettings({
                    ...restaurantSettings,
                    logo: e.target.value,
                  })
                }
              />

              {restaurantSettings.logo && (
                <div className="flex justify-center mt-2">
                  <img
                    src={restaurantSettings.logo}
                    alt="Logo"
                    className="h-40 w-40 object-contain rounded-full border-2 border-orange-400 shadow-lg"
                  />
                </div>
              )}

              <LabeledTextarea
                label="Address"
                value={restaurantSettings.address}
                onChange={(e) =>
                  setRestaurantSettings({
                    ...restaurantSettings,
                    address: e.target.value,
                  })
                }
              />

              <LabeledInput
                label="Contact"
                value={restaurantSettings.contact}
                onChange={(e) =>
                  setRestaurantSettings({
                    ...restaurantSettings,
                    contact: e.target.value,
                  })
                }
              />

              <LabeledInput
                label="Email"
                type="email"
                value={restaurantSettings.email}
                onChange={(e) =>
                  setRestaurantSettings({
                    ...restaurantSettings,
                    email: e.target.value,
                  })
                }
              />

              <LabeledInput
                label="Operating Hours"
                value={restaurantSettings.operatingHours}
                onChange={(e) =>
                  setRestaurantSettings({
                    ...restaurantSettings,
                    operatingHours: e.target.value,
                  })
                }
              />

              {/* TABLE SETTINGS */}
              <section className="bg-white p-6 rounded-2xl shadow border border-green-200 space-y-4">
                <h2 className="text-2xl font-bold text-green-600">
                  Table Settings
                </h2>
                <LabeledInput
                  label="Number of Tables"
                  type="number"
                  value={tableSettings.numberOfTables}
                  onChange={(e) =>
                    setTableSettings({
                      ...tableSettings,
                      numberOfTables: Number(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Table capacity is automatically fixed: 4, 6, 8, 10 repeating.
                </p>
              </section>

              {/* RESERVATION SETTINGS */}
              <section className="bg-white p-6 rounded-2xl shadow border border-blue-200 space-y-4">
                <h2 className="text-2xl font-bold text-blue-600">
                  Reservation Settings
                </h2>

                <LabeledInput
                  label="Max Guests"
                  type="number"
                  value={reservationSettings.maxGuests}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      maxGuests: Number(e.target.value),
                    })
                  }
                />

                <LabeledInput
                  label="Start Time"
                  value={reservationSettings.startTime}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      startTime: e.target.value,
                    })
                  }
                />

                <LabeledInput
                  label="End Time"
                  value={reservationSettings.endTime}
                  onChange={(e) =>
                    setReservationSettings({
                      ...reservationSettings,
                      endTime: e.target.value,
                    })
                  }
                />
              </section>

              {/* REVIEW SETTINGS */}
              <section className="bg-white p-6 rounded-2xl shadow border border-purple-200 space-y-4">
                <h2 className="text-2xl font-bold text-purple-600">
                  Customer Review Settings
                </h2>

                <label className="block mb-4">
                  <span className="font-medium text-gray-700">
                    Enable Reviews
                  </span>
                  <select
                    value={reviewSettings.enableReviews || "Yes"}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setReviewSettings({
                        ...reviewSettings,
                        enableReviews: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg p-2 w-full mt-1"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </label>

                <LabeledInput
                  label="Minimum Rating Allowed"
                  type="number"
                  value={reviewSettings.minRatingAllowed}
                  onChange={(e) =>
                    setReviewSettings({
                      ...reviewSettings,
                      minRatingAllowed: Number(e.target.value),
                    })
                  }
                />

                <label className="block mb-4">
                  <span className="font-medium text-gray-700">
                    Auto Approve Reviews
                  </span>
                  <select
                    value={reviewSettings.autoApproveReviews || "Yes"}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setReviewSettings({
                        ...reviewSettings,
                        autoApproveReviews: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg p-2 w-full mt-1"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </label>

                <LabeledInput
                  label="Review Display Limit"
                  type="number"
                  value={reviewSettings.reviewDisplayLimit}
                  onChange={(e) =>
                    setReviewSettings({
                      ...reviewSettings,
                      reviewDisplayLimit: Number(e.target.value),
                    })
                  }
                />

                <LabeledTextarea
                  label="Review Guidelines"
                  value={reviewSettings.reviewGuidelines}
                  onChange={(e) =>
                    setReviewSettings({
                      ...reviewSettings,
                      reviewGuidelines: e.target.value,
                    })
                  }
                />
              </section>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  className="px-8 py-4 rounded-2xl font-semibold text-white shadow bg-orange-600 hover:bg-orange-700"
                >
                  Save Settings
                </button>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ============================ STAFF SETTINGS (From Backend) ============================ */}
        <TabsContent value="staff">
          <div className="space-y-6">
            <StaffSettings />
          </div>
        </TabsContent>

        {/* ============================ NEW USER ============================ */}
        {isAdmin && (
          <TabsContent value="newUser">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Create New User
              </h2>

              {/* Pass onCreated so the form can trigger a staff refresh */}
              <CreateUserForm
                onCreated={() => {
                  // dispatch a simple event that components can listen to
                  try {
                    window.dispatchEvent(new Event("reloadStaff"));
                  } catch (e) {
                    // ignore in non-browser environments
                  }
                }}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
