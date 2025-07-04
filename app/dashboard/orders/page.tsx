"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [search, setSearch] = useState("") // Declare the search variable

  const orders = [
    {
      id: "ORD-001",
      table: "Table 5",
      customer: "John Doe",
      items: ["2x Grilled Salmon", "1x Pasta", "2x Wine"],
      total: 67.0,
      status: "preparing",
      time: "5 min ago",
      waiter: "Sarah",
      type: "dine-in",
    },
    {
      id: "ORD-002",
      table: "Table 12",
      customer: "Jane Smith",
      items: ["1x Steak", "2x Wine", "1x Dessert"],
      total: 89.0,
      status: "ready",
      time: "8 min ago",
      waiter: "Mike",
      type: "dine-in",
    },
    {
      id: "ORD-003",
      table: "Takeaway",
      customer: "Bob Johnson",
      items: ["3x Appetizer", "1x Main", "1x Drink"],
      total: 45.0,
      status: "pending",
      time: "12 min ago",
      waiter: "Lisa",
      type: "takeaway",
    },
    {
      id: "ORD-004",
      table: "Table 8",
      customer: "Alice Brown",
      items: ["2x Breakfast", "2x Coffee"],
      total: 32.0,
      status: "completed",
      time: "25 min ago",
      waiter: "Tom",
      type: "dine-in",
    },
    {
      id: "ORD-005",
      table: "Table 3",
      customer: "Charlie Wilson",
      items: ["1x Pizza", "1x Salad", "2x Soda"],
      total: 38.0,
      status: "payment-pending",
      time: "15 min ago",
      waiter: "Sarah",
      type: "dine-in",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "ready":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-red-100 text-red-800"
      case "payment-pending":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      case "preparing":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "payment-pending":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filterOrdersByStatus = (status: string) => {
    if (status === "all") return orders
    return orders.filter((order) => order.status === status)
  }

  const filteredOrders = (status: string) => {
    const statusFiltered = filterOrdersByStatus(status)
    return statusFiltered.filter(
      (order) =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()), // Use search variable here
    )
  }

  const orderStats = {
    new: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    payment: orders.filter((o) => o.status === "payment-pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Track and manage all restaurant orders</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">New Order</Button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{orderStats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Preparing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.preparing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orderStats.ready}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Payment Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{orderStats.payment}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setSearch(searchTerm)}>
          {" "}
          // Add onClick to set search value
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">New ({orderStats.new})</TabsTrigger>
          <TabsTrigger value="preparing">Preparing ({orderStats.preparing})</TabsTrigger>
          <TabsTrigger value="ready">Ready ({orderStats.ready})</TabsTrigger>
          <TabsTrigger value="payment-pending">Payment ({orderStats.payment})</TabsTrigger>
        </TabsList>

        {["all", "pending", "preparing", "ready", "payment-pending"].map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {status === "all"
                    ? "All Orders"
                    : status === "pending"
                      ? "New Orders"
                      : status === "preparing"
                        ? "Orders Being Prepared"
                        : status === "ready"
                          ? "Ready Orders"
                          : "Payment Pending Orders"}
                </CardTitle>
                <CardDescription>
                  {status === "all"
                    ? "Complete list of all orders"
                    : status === "pending"
                      ? "Orders waiting to be processed"
                      : status === "preparing"
                        ? "Orders currently in the kitchen"
                        : status === "ready"
                          ? "Orders ready for serving"
                          : "Orders awaiting payment"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Table/Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Waiter</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders(status).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.table}</div>
                            <div className="text-sm text-gray-600">{order.customer}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-sm">
                                {item}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-xs text-gray-500">+{order.items.length - 2} more items</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status.replace("-", " ")}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{order.time}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.waiter}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
