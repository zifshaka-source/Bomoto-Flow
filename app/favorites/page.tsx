'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, Restaurant } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Star, Clock, Trash2 } from 'lucide-react';

interface FavoriteRestaurant extends Restaurant {
  favorite_id: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, router]);

  async function fetchFavorites() {
    if (!user) return;

    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id, restaurant_id')
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      if (favoritesData && favoritesData.length > 0) {
        const restaurantIds = favoritesData.map((f) => f.restaurant_id);
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds);

        if (restaurantsError) throw restaurantsError;

        const favoritesWithRestaurants = restaurantsData?.map((restaurant) => ({
          ...restaurant,
          favorite_id: favoritesData.find((f) => f.restaurant_id === restaurant.id)?.id || '',
        }));

        setFavorites(favoritesWithRestaurants || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(favoriteId: string) {
    try {
      await supabase.from('favorites').delete().eq('id', favoriteId);
      setFavorites((prev) => prev.filter((f) => f.favorite_id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  const getPriceLevel = (level: number) => {
    return '₹'.repeat(level);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No favorites yet</p>
              <p className="text-gray-400 mb-6">
                Start adding restaurants to your favorites!
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Explore Restaurants
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
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
                      removeFavorite(restaurant.favorite_id);
                    }}
                    className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>

                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
