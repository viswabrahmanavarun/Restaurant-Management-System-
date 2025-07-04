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
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  DollarSign,
  Clock,
  Users,
  ChefHat,
  Flame,
  Leaf,
  Star,
  TrendingUp,
  Package,
} from "lucide-react"
import Image from "next/image"

export default function MenusPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)

  // Sample menu items data
  const menuItems = [
    {
      id: "ITEM-001",
      name: "Grilled Atlantic Salmon",
      description: "Fresh Atlantic salmon grilled to perfection with herbs and lemon, served with roasted vegetables",
      price: 28.99,
      category: "Main Course",
      image: "/placeholder.svg?height=200&width=300&text=Grilled+Salmon",
      available: true,
      popular: true,
      spicy: false,
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      prepTime: 15,
      calories: 420,
      ingredients: ["Atlantic Salmon", "Herbs", "Lemon", "Olive Oil", "Vegetables"],
      allergens: ["Fish"],
      cost: 12.5,
      profit: 16.49,
      soldToday: 23,
      soldThisWeek: 156,
      rating: 4.8,
      reviews: 89,
    },
    {
      id: "ITEM-002",
      name: "Truffle Mushroom Risotto",
      description: "Creamy arborio rice with wild mushrooms and truffle oil, finished with parmesan cheese",
      price: 24.99,
      category: "Main Course",
      image: "/placeholder.svg?height=200&width=300&text=Truffle+Risotto",
      available: true,
      popular: true,
      spicy: false,
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      prepTime: 20,
      calories: 380,
      ingredients: ["Arborio Rice", "Wild Mushrooms", "Truffle Oil", "Parmesan", "White Wine"],
      allergens: ["Dairy"],
      cost: 8.75,
      profit: 16.24,
      soldToday: 18,
      soldThisWeek: 124,
      rating: 4.6,
      reviews: 67,
    },
    {
      id: "ITEM-003",
      name: "Wagyu Beef Tenderloin",
      description: "Premium wagyu beef tenderloin with red wine jus, roasted garlic mashed potatoes",
      price: 65.99,
      category: "Main Course",
      image: "/placeholder.svg?height=200&width=300&text=Wagyu+Beef",
      available: true,
      popular: true,
      spicy: false,
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      prepTime: 25,
      calories: 580,
      ingredients: ["Wagyu Beef", "Red Wine", "Garlic", "Potatoes", "Herbs"],
      allergens: ["None"],
      cost: 28.0,
      profit: 37.99,
      soldToday: 12,
      soldThisWeek: 78,
      rating: 4.9,
      reviews: 156,
    },
    {
      id: "ITEM-004",
      name: "Vegan Buddha Bowl",
      description: "Quinoa, roasted vegetables, avocado, tahini dressing, and mixed seeds",
      price: 18.99,
      category: "Main Course",
      image: "/placeholder.svg?height=200&width=300&text=Buddha+Bowl",
      available: true,
      popular: false,
      spicy: false,
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      prepTime: 12,
      calories: 320,
      ingredients: ["Quinoa", "Mixed Vegetables", "Avocado", "Tahini", "Seeds"],
      allergens: ["Sesame"],
      cost: 6.5,
      profit: 12.49,
      soldToday: 8,
      soldThisWeek: 45,
      rating: 4.3,
      reviews: 34,
    },
    {
      id: "ITEM-005",
      name: "Spicy Tuna Tartare",
      description: "Fresh tuna with avocado, sesame, spicy mayo, and crispy wonton chips",
      price: 22.99,
      category: "Appetizer",
      image: "/placeholder.svg?height=200&width=300&text=Tuna+Tartare",
      available: true,
      popular: true,
      spicy: true,
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      prepTime: 10,
      calories: 280,
      ingredients: ["Fresh Tuna", "Avocado", "Sesame", "Spicy Mayo", "Wonton"],
      allergens: ["Fish", "Gluten", "Eggs"],
      cost: 9.25,
      profit: 13.74,
      soldToday: 15,
      soldThisWeek: 89,
      rating: 4.7,
      reviews: 78,
    },
    {
      id: "ITEM-006",
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten center, served with vanilla ice cream",
      price: 12.99,
      category: "Dessert",
      image: "/placeholder.svg?height=200&width=300&text=Lava+Cake",
      available: false,
      popular: true,
      spicy: false,
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      prepTime: 18,
      calories: 450,
      ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Vanilla Ice Cream"],
      allergens: ["Dairy", "Eggs", "Gluten"],
      cost: 4.25,
      profit: 8.74,
      soldToday: 0,
      soldThisWeek: 67,
      rating: 4.8,
      reviews: 123,
    },
  ]

  const categories = [
    { id: "appetizer", name: "Appetizers", count: 8 },
    { id: "main", name: "Main Courses", count: 15 },
    { id: "dessert", name: "Desserts", count: 6 },
    { id: "beverage", name: "Beverages", count: 12 },
    { id: "special", name: "Chef's Specials", count: 4 },
  ]

  const getAvailabilityColor = (available: boolean) => {
    return available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "appetizer":
        return "bg-blue-100 text-blue-800"
      case "main course":
        return "bg-purple-100 text-purple-800"
      case "dessert":
        return "bg-pink-100 text-pink-800"
      case "beverage":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const availableItems = menuItems.filter((item) => item.available).length
  const totalItems = menuItems.length
  const popularItems = menuItems.filter((item) => item.popular).length
  const averagePrice = menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant menu items and categories</p>
        </div>
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>Create a new menu item with all the necessary details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" placeholder="Enter item name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input id="cost" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                <Input id="prepTime" type="number" placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input id="calories" type="number" placeholder="350" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the menu item..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
                <Textarea
                  id="ingredients"
                  placeholder="Ingredient 1, Ingredient 2, Ingredient 3..."
                  className="min-h-[60px]"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="allergens">Allergens (comma separated)</Label>
                <Input id="allergens" placeholder="Dairy, Gluten, Nuts..." />
              </div>
              <div className="col-span-2 space-y-4">
                <Label>Dietary Options</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="vegetarian" />
                    <Label htmlFor="vegetarian">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="vegan" />
                    <Label htmlFor="vegan">Vegan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="glutenFree" />
                    <Label htmlFor="glutenFree">Gluten Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="spicy" />
                    <Label htmlFor="spicy">Spicy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="popular" />
                    <Label htmlFor="popular">Popular Item</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="available" defaultChecked />
                    <Label htmlFor="available">Available</Label>
                  </div>
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="image">Item Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">Add Menu Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{popularItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${averagePrice.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search menu items by name, description, or category..."
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

      {/* Menu Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="available">Available ({availableItems})</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={getAvailabilityColor(item.available)}>
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                    {item.popular && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    {item.spicy && (
                      <Badge variant="destructive">
                        <Flame className="h-3 w-3" />
                      </Badge>
                    )}
                    {item.vegetarian && (
                      <Badge className="bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3" />
                      </Badge>
                    )}
                    {item.vegan && <Badge className="bg-green-200 text-green-900">V</Badge>}
                    {item.glutenFree && <Badge className="bg-blue-100 text-blue-800">GF</Badge>}
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge className={getCategoryColor(item.category)} variant="outline">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">${item.price}</div>
                      <div className="text-sm text-gray-500">Cost: ${item.cost}</div>
                    </div>
                  </div>
                  <CardDescription className="text-sm line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{item.prepTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span>{item.calories} cal</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{item.rating}</span>
                        <span className="text-gray-500">({item.reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>Today: {item.soldToday}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>Week: {item.soldThisWeek}</span>
                        </div>
                      </div>
                      <div className="text-green-600 font-medium">Profit: ${item.profit}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ChefHat className="mr-2 h-4 w-4" />
                            Recipe Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Pricing History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Menu Items</CardTitle>
              <CardDescription>Items currently available for ordering</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Prep Time</TableHead>
                    <TableHead>Sold Today</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems
                    .filter((item) => item.available)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-600 line-clamp-1">{item.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(item.category)} variant="outline">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">${item.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {item.prepTime} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {item.soldToday}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            {item.rating}
                          </div>
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
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                Mark Unavailable
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

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{category.name}</CardTitle>
                    <Badge variant="outline">{category.count} items</Badge>
                  </div>
                  <CardDescription>Manage items in the {category.name.toLowerCase()} category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Available Items:</span>
                      <span className="font-medium">
                        {
                          menuItems.filter(
                            (item) =>
                              item.category.toLowerCase().includes(category.name.toLowerCase().slice(0, -1)) &&
                              item.available,
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Price:</span>
                      <span className="font-medium">
                        $
                        {menuItems
                          .filter((item) =>
                            item.category.toLowerCase().includes(category.name.toLowerCase().slice(0, -1)),
                          )
                          .reduce((sum, item) => sum + item.price, 0) /
                          Math.max(
                            1,
                            menuItems.filter((item) =>
                              item.category.toLowerCase().includes(category.name.toLowerCase().slice(0, -1)),
                            ).length,
                          ) || 0}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Items
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
