// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { RestaurantProvider } from "@/context/RestaurantContext";

// ⬇️ MUST IMPORT THIS
import { Toaster } from "@/components/ui/toaster";  // KEEP SAME


export const metadata: Metadata = {
  title: "Bella Vista App",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RestaurantProvider>

          {/* ⬇️ ALL YOUR PAGES */}
          {children}

          {/* ⬇️ THIS IS REQUIRED FOR TOASTS TO WORK */}
          <Toaster />

        </RestaurantProvider>
      </body>
    </html>
  );
}
