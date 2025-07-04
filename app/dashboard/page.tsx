"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, ShoppingCart, DollarSign, Clock, ChefHat } from "lucide-react"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "staff"
    setUserRole(role)
  }, [])

  const stats = [
    {
      title: "Today's Revenue",
      value: "$2,847",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Orders Today",
      value: "156",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Active Tables",
      value: "24/32",
      change: "75% occupied",
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Kitchen Queue",
      value: "8",
      change: "Avg 12 min",
      icon: ChefHat,
      color: "text-purple-600",
    },
  ]

  const recentOrders = [
    {
      id: "#ORD-001",
      table: "Table 5",
      items: "2x Grilled Salmon, 1x Pasta",
      status: "preparing",
      time: "5 min ago",
      total: "$67.00",
    },
    {
      id: "#ORD-002",
      table: "Table 12",
      items: "1x Steak, 2x Wine",
      status: "ready",
      time: "8 min ago",
      total: "$89.00",
    },
    {
      id: "#ORD-003",
      table: "Table 3",
      items: "3x Appetizer, 1x Dessert",
      status: "pending",
      time: "12 min ago",
      total: "$45.00",
    },
  ]

  const kitchenOrders = [
    {
      id: "KOT-001",
      table: "Table 8",
      items: ["2x Grilled Chicken", "1x Caesar Salad"],
      priority: "high",
      time: "2 min ago",
    },
    {
      id: "KOT-002",
      table: "Table 15",
      items: ["1x Fish & Chips", "1x Soup"],
      priority: "medium",
      time: "7 min ago",
    },
    {
      id: "KOT-003",
      table: "Table 6",
      items: ["2x Pasta", "1x Garlic Bread"],
      priority: "low",
      time: "15 min ago",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest orders from your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{order.id}</span>
                      <Badge variant="outline">{order.table}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.items}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <span className="text-xs text-gray-500">{order.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{order.total}</div>
                    <Button size="sm" variant="outline" className="mt-2">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Kitchen Orders (KOT)
            </CardTitle>
            <CardDescription>Orders currently in the kitchen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kitchenOrders.map((order, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.id}</span>
                      <Badge variant="outline">{order.table}</Badge>
                    </div>
                    <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                  </div>
                  <div className="space-y-1 mb-2">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-sm text-gray-600">
                        • {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.time}
                    </span>
                    <Button size="sm" variant="outline">
                      Mark Ready
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions for efficient management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              New Order
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              Reserve Table
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <ChefHat className="h-6 w-6" />
              Kitchen View
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              Daily Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
