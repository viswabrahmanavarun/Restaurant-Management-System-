"use client"

import type React from "react"
import { useState, useEffect } from "react"

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import {
  ChefHat,
  LayoutDashboard,
  ShoppingCart,
  Calendar,
  Star,
  MenuIcon,
  Package,
  Settings,
  Users,
  LogOut,
  Bell,
  QrCode,
  Building2,
  ChevronDown,
  ChevronRight,
  Boxes,
  ReceiptText,
  BarChart3,
} from "lucide-react"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useRestaurant } from "@/context/RestaurantContext"

import { Toaster } from "@/components/ui/toaster"

/* ===============================
    MENU ITEMS
================================ */
const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
    submenu: [
      { title: "All Orders", href: "/dashboard/orders" },
      { title: "New Orders", href: "/dashboard/orders/new" },
      { title: "Pending Orders", href: "/dashboard/orders/pending" },
      { title: "Payment Pending", href: "/dashboard/orders/payment" },
    ],
  },
  {
    title: "Kitchen",
    icon: ChefHat,
    href: "/dashboard/kitchen",
    submenu: [
      { title: "All Kitchen Orders", href: "/dashboard/kitchen" },
      { title: "New Orders", href: "/dashboard/kitchen/new" },
      { title: "In Queue", href: "/dashboard/kitchen/queue" },
      { title: "Ready Orders", href: "/dashboard/kitchen/ready" },
    ],
  },
  {
    title: "Reservations",
    icon: Calendar,
    href: "/dashboard/reservations",
    submenu: [
      { title: "All Reservations", href: "/dashboard/reservations" },
      { title: "New Reservation", href: "/dashboard/reservations/new" },
      { title: "Today's Reservations", href: "/dashboard/reservations/today" },
      { title: "Confirmed", href: "/dashboard/reservations/confirmed" },
    ],
  },
  {
    title: "Customer Reviews",
    icon: Star,
    href: "/dashboard/reviews",
    submenu: [
      { title: "All Reviews", href: "/dashboard/reviews" },
      { title: "Add Review", href: "/dashboard/reviews/add" },
      { title: "Pending Reviews", href: "/dashboard/reviews/pending" },
      { title: "Published Reviews", href: "/dashboard/reviews/published" },
    ],
  },
  {
    title: "Menu Management",
    icon: MenuIcon,
    href: "/dashboard/menus",
    submenu: [
      { title: "All Menu Items", href: "/dashboard/menus" },
      { title: "Add Menu Item", href: "/dashboard/menus/add" },
      { title: "Available Items", href: "/dashboard/menus/available" },
      { title: "Categories", href: "/dashboard/menus/categories" },
    ],
  },

  { title: "Suppliers", icon: Package, href: "/dashboard/suppliers" },
  { title: "Inventory", icon: Boxes, href: "/dashboard/inventory" },
  { title: "Invoices", icon: ReceiptText, href: "/dashboard/invoices" },
  { title: "Daily Usage", icon: BarChart3, href: "/dashboard/usage" },
]

/* ===============================
    MAIN LAYOUT
================================ */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { restaurantDetails } = useRestaurant()
  const [userRole, setUserRole] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("Downtown Branch")
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!role) router.push("/login")
    else setUserRole(role)
  }, [router])

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu) {
        const active = item.submenu.some((m) => pathname === m.href)
        if (active && !expandedItems.includes(item.title)) {
          setExpandedItems((prev) => [...prev, item.title])
        }
      }
    })
  }, [pathname, expandedItems])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const isItemActive = (href: string) => pathname === href
  const hasActiveSubmenu = (submenu: any[]) =>
    submenu.some((sub) => pathname === sub.href)

  const branches = [
    "Downtown Branch",
    "Mall Branch",
    "Airport Branch",
    "Beachside Branch",
  ]

  return (
    <SidebarProvider>
      <Sidebar className="border-r bg-white" collapsible="icon">
        
        {/* HEADER */}
        <SidebarHeader className="border-b bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 text-white">
                    <ChefHat className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{restaurantDetails.name}</span>
                    <span className="text-xs text-orange-100">Restaurant POS</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarGroup className="py-2">
            <SidebarGroupContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedBranch}
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {branches.map((b) => (
                    <DropdownMenuItem key={b} onClick={() => setSelectedBranch(b)}>
                      {b}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>

        {/* SIDEBAR CONTENT */}
        <SidebarContent className="bg-gray-50/50">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 pt-3 text-xs font-semibold text-gray-500 uppercase">
              Main Menu
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.submenu ? (
                      <Collapsible
                        open={expandedItems.includes(item.title)}
                        onOpenChange={() => toggleExpanded(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`group justify-between ${
                              hasActiveSubmenu(item.submenu) ||
                              isItemActive(item.href)
                                ? "bg-orange-100 text-orange-700 border-r-2 border-orange-600"
                                : "text-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {expandedItems.includes(item.title) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="ml-6 mt-1 space-y-1 border-l pl-4">
                            {item.submenu.map((sub) => (
                              <SidebarMenuButton
                                key={sub.title}
                                asChild
                                className={`text-sm ${
                                  isItemActive(sub.href)
                                    ? "bg-orange-100 text-orange-700"
                                    : "text-gray-600"
                                }`}
                              >
                                <Link href={sub.href}>{sub.title}</Link>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={`${
                          isItemActive(item.href)
                            ? "bg-orange-100 text-orange-700 border-r-2 border-orange-600"
                            : "text-gray-700"
                        }`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* QUICK ACCESS */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Quick Access
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {userRole === "admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`${
                        isItemActive("/dashboard/settings")
                          ? "bg-orange-100 text-orange-700 border-r-2 border-orange-600"
                          : "text-gray-700"
                      }`}
                    >
                      <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/menu" target="_blank">
                      <QrCode className="h-4 w-4" />
                      <span>Public Menu</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* FOOTER */}
        <SidebarFooter className="border-t bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {userRole.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <span className="text-sm">{userRole}</span>
                      <span className="text-xs text-green-600">● Online</span>
                    </div>

                    <ChevronDown className="ml-auto h-3 w-3" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* ⭐ FIXED PROFILE BUTTON ⭐ */}
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Users className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>

                  {userRole === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* MAIN PAGE */}
      <SidebarInset>
        <header className="flex h-16 items-center border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <div className="h-6 w-px bg-gray-300" />
            <h2 className="text-lg font-semibold capitalize">
              {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Badge className="bg-orange-50 text-orange-700">{selectedBranch}</Badge>
          </div>
        </header>

        <main className="flex-1 bg-gray-50/30 p-6">{children}</main>

        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}
