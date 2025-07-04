"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Reply,
  Flag,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react"

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false)

  // Sample reviews data
  const reviews = [
    {
      id: "REV-001",
      customerName: "Sarah Johnson",
      email: "sarah@example.com",
      rating: 5,
      title: "Absolutely Amazing Experience!",
      comment:
        "The food was exceptional, service was outstanding, and the ambiance was perfect for our anniversary dinner. The grilled salmon was cooked to perfection and the chocolate soufflé was divine. Will definitely be back!",
      date: "2024-01-14",
      orderNumber: "ORD-156",
      table: "Table 12",
      waiter: "Mike",
      status: "published",
      helpful: 12,
      category: "food",
      response: "Thank you so much for your wonderful review! We're thrilled you enjoyed your anniversary dinner.",
    },
    {
      id: "REV-002",
      customerName: "John Smith",
      email: "john@example.com",
      rating: 4,
      title: "Great Food, Slow Service",
      comment:
        "The food quality was excellent, especially the truffle pasta. However, we had to wait quite a while for our order to arrive. The staff was friendly but seemed overwhelmed.",
      date: "2024-01-13",
      orderNumber: "ORD-145",
      table: "Table 8",
      waiter: "Lisa",
      status: "published",
      helpful: 8,
      category: "service",
      response: "Thank you for your feedback. We're working on improving our service times during peak hours.",
    },
    {
      id: "REV-003",
      customerName: "Emily Davis",
      email: "emily@example.com",
      rating: 5,
      title: "Perfect Birthday Celebration",
      comment:
        "Celebrated my birthday here and it was perfect! The staff surprised me with a complimentary dessert and sang happy birthday. The atmosphere is cozy and romantic.",
      date: "2024-01-12",
      orderNumber: "ORD-134",
      table: "Table 5",
      waiter: "Sarah",
      status: "published",
      helpful: 15,
      category: "ambiance",
      response: "Happy birthday! We're so glad we could make your special day memorable.",
    },
    {
      id: "REV-004",
      customerName: "Michael Brown",
      email: "michael@example.com",
      rating: 3,
      title: "Average Experience",
      comment:
        "The food was okay but nothing special. The prices are a bit high for what you get. The location is nice though.",
      date: "2024-01-11",
      orderNumber: "ORD-128",
      table: "Table 15",
      waiter: "Tom",
      status: "pending",
      helpful: 3,
      category: "value",
      response: "",
    },
    {
      id: "REV-005",
      customerName: "Lisa Wilson",
      email: "lisa@example.com",
      rating: 2,
      title: "Disappointing Visit",
      comment:
        "Unfortunately, our experience was not great. The steak was overcooked and the vegetables were cold. When we mentioned it to the waiter, they didn't seem to care much.",
      date: "2024-01-10",
      orderNumber: "ORD-119",
      table: "Table 3",
      waiter: "Mike",
      status: "flagged",
      helpful: 2,
      category: "food",
      response: "",
    },
  ]

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "flagged":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "food":
        return "bg-blue-100 text-blue-800"
      case "service":
        return "bg-purple-100 text-purple-800"
      case "ambiance":
        return "bg-green-100 text-green-800"
      case "value":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const totalReviews = reviews.length
  const publishedReviews = reviews.filter((r) => r.status === "published").length
  const pendingReviews = reviews.filter((r) => r.status === "pending").length

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Satisfaction</h1>
          <p className="text-gray-600">Manage customer reviews and feedback</p>
        </div>
        <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Customer Review</DialogTitle>
              <DialogDescription>Add a review on behalf of a customer or from feedback forms</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" placeholder="Enter customer name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="customer@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" placeholder="ORD-XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table">Table</Label>
                <Input id="table" placeholder="Table 5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars - Excellent</SelectItem>
                    <SelectItem value="4">4 Stars - Very Good</SelectItem>
                    <SelectItem value="3">3 Stars - Good</SelectItem>
                    <SelectItem value="2">2 Stars - Fair</SelectItem>
                    <SelectItem value="1">1 Star - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food Quality</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="ambiance">Ambiance</SelectItem>
                    <SelectItem value="value">Value for Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Review Title</Label>
                <Input id="title" placeholder="Brief title for the review" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="comment">Review Comment</Label>
                <Textarea id="comment" placeholder="Customer's detailed feedback..." className="min-h-[100px]" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddReviewOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">Add Review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= averageRating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>Breakdown of customer ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-8">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reviews by customer name, comment, or order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Reviews Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedReviews})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingReviews})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {review.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{review.customerName}</h3>
                          <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                          <Badge className={getCategoryColor(review.category)}>{review.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className={`font-medium ${getRatingColor(review.rating)}`}>{review.rating}/5</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {review.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {review.table} • {review.waiter}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Order: {review.orderNumber}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {review.helpful} helpful
                          </div>
                        </div>
                      </div>
                    </div>
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
                          <Reply className="mr-2 h-4 w-4" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="mr-2 h-4 w-4" />
                          Flag Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                {review.response && (
                  <CardContent className="pt-0">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                          <Reply className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-medium text-orange-800">Restaurant Response</span>
                      </div>
                      <p className="text-orange-700">{review.response}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle>Published Reviews</CardTitle>
              <CardDescription>Reviews that are visible to the public</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Helpful</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews
                    .filter((r) => r.status === "published")
                    .map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{review.customerName}</div>
                            <div className="text-sm text-gray-600">{review.orderNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className={`font-medium ${getRatingColor(review.rating)}`}>{review.rating}</span>
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{review.title}</div>
                            <div className="text-sm text-gray-600 truncate">{review.comment}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(review.category)}>{review.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{review.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{review.helpful}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>Reviews awaiting moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews
                  .filter((r) => r.status === "pending")
                  .map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{review.customerName}</h3>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            Reply & Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Reviews</CardTitle>
              <CardDescription>Reviews that require attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews
                  .filter((r) => r.status === "flagged")
                  .map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{review.customerName}</h3>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <Badge className="bg-red-100 text-red-800">Flagged</Badge>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Flag className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-800">Requires Attention</span>
                          </div>
                          <p className="text-red-700 text-sm">
                            This review has been flagged for poor rating and service complaints. Consider reaching out
                            to the customer directly.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Contact Customer
                          </Button>
                          <Button size="sm" variant="outline">
                            Reply Publicly
                          </Button>
                          <Button size="sm" variant="outline">
                            Mark Resolved
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
