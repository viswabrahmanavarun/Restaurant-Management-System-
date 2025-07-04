"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Clock, ChefHat, AlertTriangle, CheckCircle, Timer, Search } from "lucide-react"

export default function KitchenPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const kitchenOrders = [
    {
      id: "KOT-001",
      orderId: "ORD-001",
      table: "Table 5",
      items: [
        { name: "Grilled Salmon", quantity: 2, status: "preparing", cookTime: 15, elapsed: 8 },
        { name: "Truffle Pasta", quantity: 1, status: "pending", cookTime: 12, elapsed: 0 },
      ],
      priority: "high",
      waiter: "Sarah",
      orderTime: "2 min ago",
      estimatedTime: "8 min",
      specialInstructions: "No salt on salmon",
    },
    {
      id: "KOT-002",
      orderId: "ORD-002",
      table: "Table 12",
      items: [
        { name: "Wagyu Steak", quantity: 1, status: "preparing", cookTime: 20, elapsed: 15 },
        { name: "Roasted Vegetables", quantity: 1, status: "ready", cookTime: 10, elapsed: 10 },
      ],
      priority: "medium",
      waiter: "Mike",
      orderTime: "7 min ago",
      estimatedTime: "5 min",
      specialInstructions: "Medium rare steak",
    },
    {
      id: "KOT-003",
      orderId: "ORD-003",
      table: "Table 8",
      items: [
        { name: "Fish & Chips", quantity: 1, status: "pending", cookTime: 18, elapsed: 0 },
        { name: "Caesar Salad", quantity: 1, status: "pending", cookTime: 5, elapsed: 0 },
      ],
      priority: "low",
      waiter: "Lisa",
      orderTime: "15 min ago",
      estimatedTime: "18 min",
      specialInstructions: "Extra crispy chips",
    },
    {
      id: "KOT-004",
      orderId: "ORD-004",
      table: "Table 3",
      items: [
        { name: "Lobster Risotto", quantity: 2, status: "ready", cookTime: 25, elapsed: 25 },
        { name: "Garlic Bread", quantity: 1, status: "ready", cookTime: 8, elapsed: 8 },
      ],
      priority: "high",
      waiter: "Tom",
      orderTime: "25 min ago",
      estimatedTime: "Ready",
      specialInstructions: "",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800"
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      case "preparing":
        return <Timer className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filterOrdersByStatus = (status: string) => {
    if (status === "all") return kitchenOrders
    return kitchenOrders.filter((order) => order.items.some((item) => item.status === status))
  }

  const kitchenStats = {
    new: kitchenOrders.filter((o) => o.items.some((i) => i.status === "pending")).length,
    preparing: kitchenOrders.filter((o) => o.items.some((i) => i.status === "preparing")).length,
    ready: kitchenOrders.filter((o) => o.items.every((i) => i.status === "ready")).length,
    total: kitchenOrders.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Orders (KOT)</h1>
          <p className="text-gray-600">Manage kitchen orders and cooking queue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Timer className="h-4 w-4 mr-2" />
            Timer View
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <ChefHat className="h-4 w-4 mr-2" />
            Kitchen Display
          </Button>
        </div>
      </div>

      {/* Kitchen Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New KOT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kitchenStats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kitchenStats.preparing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kitchenStats.ready}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kitchenStats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search KOT by ID or table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kitchen Orders */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All KOT</TabsTrigger>
          <TabsTrigger value="pending">New ({kitchenStats.new})</TabsTrigger>
          <TabsTrigger value="preparing">In Queue ({kitchenStats.preparing})</TabsTrigger>
          <TabsTrigger value="ready">Ready ({kitchenStats.ready})</TabsTrigger>
        </TabsList>

        {["all", "pending", "preparing", "ready"].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterOrdersByStatus(status).map((order) => (
                <Card
                  key={order.id}
                  className={`border-l-4 ${
                    order.priority === "high"
                      ? "border-l-red-500"
                      : order.priority === "medium"
                        ? "border-l-yellow-500"
                        : "border-l-green-500"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <CardDescription>
                          {order.table} • Order {order.orderId}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {order.priority === "medium" && <Clock className="h-3 w-3 mr-1" />}
                          {order.priority}
                        </Badge>
                        <Badge variant="outline">{order.waiter}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Items */}
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {item.quantity}x {item.name}
                                </div>
                                <div className="text-sm text-gray-600">Cook time: {item.cookTime} min</div>
                              </div>
                              <Badge className={getStatusColor(item.status)}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{item.status}</span>
                              </Badge>
                            </div>
                            {item.status === "preparing" && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>
                                    {item.elapsed}/{item.cookTime} min
                                  </span>
                                </div>
                                <Progress value={(item.elapsed / item.cookTime) * 100} className="h-2" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-yellow-800">Special Instructions</div>
                              <div className="text-sm text-yellow-700">{order.specialInstructions}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Info */}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Ordered: {order.orderTime}</span>
                        <span className="font-medium">ETA: {order.estimatedTime}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {order.items.some((item) => item.status === "pending") && (
                          <Button size="sm" className="flex-1">
                            Start Cooking
                          </Button>
                        )}
                        {order.items.some((item) => item.status === "preparing") && (
                          <Button size="sm" variant="outline" className="flex-1">
                            Mark Ready
                          </Button>
                        )}
                        {order.items.every((item) => item.status === "ready") && (
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Order
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Timer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
