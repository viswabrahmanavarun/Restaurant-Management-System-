"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Search, Star, Clock, Flame } from "lucide-react"
import Image from "next/image"

export default function PublicMenuPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const categories = [
    { id: "appetizers", name: "Appetizers", icon: "🥗" },
    { id: "mains", name: "Main Courses", icon: "🍽️" },
    { id: "desserts", name: "Desserts", icon: "🍰" },
    { id: "beverages", name: "Beverages", icon: "🥤" },
    { id: "specials", name: "Chef's Specials", icon: "⭐" },
  ]

  const menuItems = {
    appetizers: [
      {
        id: 1,
        name: "Truffle Arancini",
        description: "Crispy risotto balls with truffle oil and parmesan",
        price: 16,
        image: "/placeholder.svg?height=200&width=300&text=Truffle+Arancini",
        dietary: ["vegetarian"],
        spicy: false,
        popular: true,
        prepTime: "15 min",
      },
      {
        id: 2,
        name: "Seared Scallops",
        description: "Pan-seared scallops with cauliflower puree and pancetta",
        price: 22,
        image: "/placeholder.svg?height=200&width=300&text=Seared+Scallops",
        dietary: ["gluten-free"],
        spicy: false,
        popular: false,
        prepTime: "12 min",
      },
      {
        id: 3,
        name: "Spicy Tuna Tartare",
        description: "Fresh tuna with avocado, sesame, and spicy mayo",
        price: 18,
        image: "/placeholder.svg?height=200&width=300&text=Tuna+Tartare",
        dietary: ["gluten-free"],
        spicy: true,
        popular: true,
        prepTime: "10 min",
      },
    ],
    mains: [
      {
        id: 4,
        name: "Wagyu Beef Tenderloin",
        description: "Premium wagyu with roasted vegetables and red wine jus",
        price: 65,
        image: "/placeholder.svg?height=200&width=300&text=Wagyu+Beef",
        dietary: ["gluten-free"],
        spicy: false,
        popular: true,
        prepTime: "25 min",
      },
      {
        id: 5,
        name: "Lobster Risotto",
        description: "Creamy arborio rice with fresh lobster and herbs",
        price: 42,
        image: "/placeholder.svg?height=200&width=300&text=Lobster+Risotto",
        dietary: ["gluten-free"],
        spicy: false,
        popular: true,
        prepTime: "20 min",
      },
      {
        id: 6,
        name: "Vegan Buddha Bowl",
        description: "Quinoa, roasted vegetables, tahini dressing, and seeds",
        price: 24,
        image: "/placeholder.svg?height=200&width=300&text=Buddha+Bowl",
        dietary: ["vegan", "gluten-free"],
        spicy: false,
        popular: false,
        prepTime: "15 min",
      },
    ],
    desserts: [
      {
        id: 7,
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center and vanilla ice cream",
        price: 14,
        image: "/placeholder.svg?height=200&width=300&text=Lava+Cake",
        dietary: ["vegetarian"],
        spicy: false,
        popular: true,
        prepTime: "18 min",
      },
      {
        id: 8,
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 12,
        image: "/placeholder.svg?height=200&width=300&text=Tiramisu",
        dietary: ["vegetarian"],
        spicy: false,
        popular: true,
        prepTime: "5 min",
      },
    ],
    beverages: [
      {
        id: 9,
        name: "Craft Cocktails",
        description: "House-made cocktails with premium spirits",
        price: 16,
        image: "/placeholder.svg?height=200&width=300&text=Cocktails",
        dietary: [],
        spicy: false,
        popular: true,
        prepTime: "5 min",
      },
      {
        id: 10,
        name: "Wine Selection",
        description: "Curated wines from around the world",
        price: 12,
        image: "/placeholder.svg?height=200&width=300&text=Wine",
        dietary: [],
        spicy: false,
        popular: false,
        prepTime: "2 min",
      },
    ],
    specials: [
      {
        id: 11,
        name: "Chef's Tasting Menu",
        description: "7-course tasting menu featuring seasonal ingredients",
        price: 95,
        image: "/placeholder.svg?height=200&width=300&text=Tasting+Menu",
        dietary: [],
        spicy: false,
        popular: true,
        prepTime: "90 min",
      },
    ],
  }

  const getDietaryIcon = (dietary: string) => {
    switch (dietary) {
      case "vegetarian":
        return "🌱"
      case "vegan":
        return "🌿"
      case "gluten-free":
        return "🌾"
      default:
        return ""
    }
  }

  const filteredItems = (items: any[]) => {
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bella Vista</h1>
                <p className="text-sm text-gray-600">Downtown Branch</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Table #12</p>
              <p className="text-xs text-gray-500">Scan QR to order</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Menu Categories */}
        <Tabs defaultValue="appetizers" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <span className="mr-1">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
                <p className="text-gray-600">Discover our carefully crafted {category.name.toLowerCase()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems(menuItems[category.id as keyof typeof menuItems] || []).map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      {item.popular && (
                        <Badge className="absolute top-3 left-3 bg-orange-600">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {item.spicy && (
                        <Badge variant="destructive" className="absolute top-3 right-3">
                          <Flame className="h-3 w-3 mr-1" />
                          Spicy
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <span className="text-xl font-bold text-orange-600">${item.price}</span>
                      </div>
                      <CardDescription className="text-sm">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{item.prepTime}</span>
                        </div>
                        <div className="flex gap-1">
                          {item.dietary.map((diet) => (
                            <span key={diet} className="text-lg" title={diet}>
                              {getDietaryIcon(diet)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">Add to Order</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center py-8 border-t">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="h-6 w-6 text-orange-600" />
            <span className="text-xl font-bold text-gray-900">Bella Vista</span>
          </div>
          <p className="text-gray-600 mb-2">123 Culinary Street, Downtown</p>
          <p className="text-gray-600">(555) 123-4567 | info@bellavista.com</p>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              Call Waiter
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
