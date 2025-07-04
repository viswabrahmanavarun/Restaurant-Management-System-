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
  Clock,
  Calendar,
  Star,
  MenuIcon,
  Package,
  FileText,
  TrendingUp,
  Settings,
  Users,
  LogOut,
  Bell,
  QrCode,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    badge: null,
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
    badge: "12",
    submenu: [
      { title: "All Orders", href: "/dashboard/orders" },
      { title: "New Orders", href: "/dashboard/orders/new", badge: "5" },
      { title: "Pending Orders", href: "/dashboard/orders/pending", badge: "3" },
      { title: "Payment Pending", href: "/dashboard/orders/payment", badge: "4" },
    ],
  },
  {
    title: "Kitchen Orders",
    icon: ChefHat,
    href: "/dashboard/kitchen",
    badge: "8",
    submenu: [
      { title: "All Kitchen Orders", href: "/dashboard/kitchen" },
      { title: "New KOT", href: "/dashboard/kitchen/new", badge: "3" },
      { title: "In Queue", href: "/dashboard/kitchen/queue", badge: "5" },
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
      { title: "Today's Reservations", href: "/dashboard/reservations/today", badge: "7" },
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
      { title: "Pending Reviews", href: "/dashboard/reviews/pending", badge: "3" },
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
  {
    title: "Suppliers",
    icon: Package,
    href: "/dashboard/suppliers",
  },
  {
    title: "Inventory",
    icon: TrendingUp,
    href: "/dashboard/inventory",
  },
  {
    title: "Invoices",
    icon: FileText,
    href: "/dashboard/invoices",
  },
  {
    title: "Daily Usage",
    icon: Clock,
    href: "/dashboard/usage",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userRole, setUserRole] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("Downtown Branch")
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!role) {
      router.push("/login")
    } else {
      setUserRole(role)
    }
  }, [router])

  useEffect(() => {
    // Auto-expand parent menu if current path matches submenu item
    menuItems.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some((subItem) => pathname === subItem.href)
        if (hasActiveSubmenu && !expandedItems.includes(item.title)) {
          setExpandedItems((prev) => [...prev, item.title])
        }
      }
    })
  }, [pathname, expandedItems])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemTitle) ? prev.filter((item) => item !== itemTitle) : [...prev, itemTitle],
    )
  }

  const isItemActive = (href: string) => pathname === href
  const hasActiveSubmenu = (submenu: any[]) => submenu.some((subItem) => pathname === subItem.href)

  const branches = ["Downtown Branch", "Mall Branch", "Airport Branch", "Beachside Branch"]

  return (
    <SidebarProvider>
      <Sidebar className="border-r bg-white" collapsible="icon">
        <SidebarHeader className="border-b bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-orange-500/20">
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/20 text-white">
                    <ChefHat className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-white">Bella Vista</span>
                    <span className="text-xs text-orange-100">Restaurant POS</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Branch Selector */}
          <SidebarGroup className="py-2">
            <SidebarGroupContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-white hover:bg-white/10 border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="truncate text-sm">{selectedBranch}</span>
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                  {branches.map((branch) => (
                    <DropdownMenuItem key={branch} onClick={() => setSelectedBranch(branch)}>
                      {branch}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent className="bg-gray-50/50">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
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
                            className={`group w-full justify-between hover:bg-orange-50 hover:text-orange-700 transition-colors ${
                              hasActiveSubmenu(item.submenu) || isItemActive(item.href)
                                ? "bg-orange-100 text-orange-700 border-r-2 border-orange-600"
                                : "text-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span className="font-medium">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                              {expandedItems.includes(item.title) ? (
                                <ChevronDown className="h-3 w-3 transition-transform" />
                              ) : (
                                <ChevronRight className="h-3 w-3 transition-transform" />
                              )}
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1">
                          <div className="ml-6 space-y-1 border-l border-gray-200 pl-4">
                            {item.submenu.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.title}
                                asChild
                                className={`text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors ${
                                  isItemActive(subItem.href)
                                    ? "bg-orange-100 text-orange-700 font-medium"
                                    : "text-gray-600"
                                }`}
                              >
                                <Link href={subItem.href} className="flex items-center justify-between">
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </Link>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-colors ${
                          isItemActive(item.href)
                            ? "bg-orange-100 text-orange-700 border-r-2 border-orange-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <Link href={item.href} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Quick Access
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={`hover:bg-orange-50 hover:text-orange-700 transition-colors ${
                      isItemActive("/dashboard/settings")
                        ? "bg-orange-100 text-orange-700 border-r-2 border-orange-600"
                        : "text-gray-700"
                    }`}
                  >
                    <Link href="/dashboard/settings">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-orange-50 hover:text-orange-700 transition-colors text-gray-700"
                  >
                    <Link href="/menu" target="_blank">
                      <QrCode className="h-4 w-4" />
                      <span className="font-medium">Public Menu</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full hover:bg-gray-50">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {userRole.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium capitalize text-gray-900">{userRole}</span>
                      <span className="text-xs text-green-600">● Online</span>
                    </div>
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-dropdown-menu-trigger-width]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1 hover:bg-gray-100" />
          <div className="flex items-center gap-2 flex-1">
            <div className="h-6 w-px bg-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="hover:bg-gray-50">
              <Bell className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {selectedBranch}
            </Badge>
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-50/30">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
