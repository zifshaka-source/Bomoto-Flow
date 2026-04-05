'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Restaurant } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Search, Star, Clock, Heart, User, MapPin, Percent, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    fetchRestaurants();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortRestaurants();
  }, [searchQuery, restaurants, selectedCuisine, sortBy]);

  async function fetchRestaurants() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
      setFilteredRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFavorites() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map((f) => f.restaurant_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  async function toggleFavorite(restaurantId: string) {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      if (favorites.has(restaurantId)) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(restaurantId);
          return newSet;
        });
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, restaurant_id: restaurantId }]);
        setFavorites((prev) => new Set(prev).add(restaurantId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  function filterAndSortRestaurants() {
    let filtered = restaurants;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine_tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedCuisine !== 'all') {
      filtered = filtered.filter((restaurant) =>
        restaurant.cuisine_tags.some((tag) =>
          tag.toLowerCase().includes(selectedCuisine.toLowerCase())
        )
      );
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price_level - b.price_level;
      if (sortBy === 'price-high') return b.price_level - a.price_level;
      return 0;
    });

    setFilteredRestaurants(filtered);
  }

  const getPriceLevel = (level: number) => {
    return '₹'.repeat(level);
  };

  const allCuisines = Array.from(
    new Set(restaurants.flatMap((r) => r.cuisine_tags))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Bomato
              </h1>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                India
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => router.push('/offers')}
              >
                <Percent className="h-4 w-4" />
                Offers
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/orders')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favorites')}>
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <MapPin className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Delivering to:</span>
            <Button variant="ghost" size="sm" className="text-sm font-semibold">
              Mumbai, Maharashtra
            </Button>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-gray-200 focus:border-orange-500 focus:ring-orange-500 shadow-sm"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-8 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Special Offers Available!
              </h2>
              <p className="text-gray-600">
                Get up to 50% off on selected restaurants
              </p>
            </div>
            <Button
              onClick={() => router.push('/offers')}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              View Offers
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Restaurants Near You
          </h2>
          <div className="flex gap-3">
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {allCuisines.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No restaurants found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                onClick={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {restaurant.rating}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(restaurant.id);
                    }}
                    className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.has(restaurant.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>

                  <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                    <span className="font-medium text-orange-600 text-lg">
                      {getPriceLevel(restaurant.price_level)}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{restaurant.delivery_time}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisine_tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/restaurant/${restaurant.id}`);
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-semibold"
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
                Bomato
              </h3>
              <p className="text-gray-400">
                Your favorite restaurants, delivered to your doorstep.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Careers</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Restaurants</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">Partner with us</li>
                <li className="hover:text-white cursor-pointer">Restaurant Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bomato. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
