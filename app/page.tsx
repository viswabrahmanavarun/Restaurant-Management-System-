import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MapPin, Phone, Mail, ChefHat, Users, Award, Utensils } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  const menuItems = [
    {
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with herbs and lemon",
      price: "$28",
      image: "/placeholder.svg?height=200&width=300&text=Grilled+Salmon",
      category: "Main Course",
    },
    {
      name: "Truffle Pasta",
      description: "Handmade pasta with black truffle and parmesan",
      price: "$24",
      image: "/placeholder.svg?height=200&width=300&text=Truffle+Pasta",
      category: "Main Course",
    },
    {
      name: "Chocolate Soufflé",
      description: "Rich chocolate soufflé with vanilla ice cream",
      price: "$12",
      image: "/placeholder.svg?height=200&width=300&text=Chocolate+Soufflé",
      category: "Dessert",
    },
  ]

  const reviews = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely amazing food and service! The ambiance is perfect for a romantic dinner.",
      date: "2 days ago",
    },
    {
      name: "Michael Chen",
      rating: 5,
      comment: "Best restaurant in the city. The chef's special was incredible!",
      date: "1 week ago",
    },
    {
      name: "Emily Davis",
      rating: 4,
      comment: "Great experience overall. Will definitely come back with friends.",
      date: "2 weeks ago",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">Bella Vista</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#menu" className="text-gray-700 hover:text-orange-600 transition-colors">
              Menu
            </a>
            <a href="#about" className="text-gray-700 hover:text-orange-600 transition-colors">
              About
            </a>
            <a href="#reviews" className="text-gray-700 hover:text-orange-600 transition-colors">
              Reviews
            </a>
            <a href="#contact" className="text-gray-700 hover:text-orange-600 transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/menu">View Menu</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Staff Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
        <Image
          src="/placeholder.svg?height=600&width=1200&text=Restaurant+Interior"
          alt="Restaurant Interior"
          fill
          className="object-cover"
        />
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to <span className="text-orange-400">Bella Vista</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Experience culinary excellence in the heart of the city
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Reserve a Table
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              View Our Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Chefs</h3>
              <p className="text-gray-600">World-class chefs creating culinary masterpieces</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600">Locally sourced, organic ingredients daily</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exceptional Service</h3>
              <p className="text-gray-600">Attentive staff ensuring perfect dining experience</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Award Winning</h3>
              <p className="text-gray-600">Recognized for excellence in fine dining</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section id="menu" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Dishes</h2>
            <p className="text-xl text-gray-600">Discover our chef's signature creations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {menuItems.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  <Badge className="absolute top-4 left-4 bg-orange-600">{item.category}</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <span className="text-2xl font-bold text-orange-600">{item.price}</span>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/menu">View Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2010, Bella Vista has been serving exceptional cuisine with a passion for culinary
                excellence. Our commitment to using the finest ingredients and innovative cooking techniques has made us
                a beloved destination for food enthusiasts.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With multiple locations across the city, we continue to expand our reach while maintaining the intimate,
                welcoming atmosphere that our guests have come to love.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-600">13+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">5</div>
                  <div className="text-sm text-gray-600">Locations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">50K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="relative h-96">
              <Image
                src="/placeholder.svg?height=400&width=500&text=Chef+Cooking"
                alt="Chef cooking"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Guests Say</h2>
            <p className="text-xl text-gray-600">Real reviews from real customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{review.date}</span>
                  </div>
                  <p className="text-gray-700 mb-4">"{review.comment}"</p>
                  <div className="font-semibold text-gray-900">{review.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Visit Us</h2>
            <p className="text-xl text-gray-600">We'd love to welcome you to Bella Vista</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <MapPin className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Location</h3>
                <p className="text-gray-600">
                  123 Culinary Street
                  <br />
                  Downtown, City 12345
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hours</h3>
                <p className="text-gray-600">
                  Mon-Thu: 5:00 PM - 10:00 PM
                  <br />
                  Fri-Sun: 5:00 PM - 11:00 PM
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0">
                <Phone className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Contact</h3>
                <p className="text-gray-600">
                  Phone: (555) 123-4567
                  <br />
                  Email: info@bellavista.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-8 w-8 text-orange-400" />
                <span className="text-2xl font-bold">Bella Vista</span>
              </div>
              <p className="text-gray-400">Experience culinary excellence in the heart of the city.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#menu" className="hover:text-orange-400 transition-colors">
                    Menu
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-orange-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-orange-400 transition-colors">
                    Reviews
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-orange-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Dine In</li>
                <li>Takeaway</li>
                <li>Catering</li>
                <li>Private Events</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@bellavista.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>123 Culinary Street</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bella Vista Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
