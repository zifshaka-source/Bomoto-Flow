'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Restaurant } from '@/lib/supabase';
import { Star, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_vegetarian: boolean;
  is_spicy: boolean;
}

export default function RestaurantDetail() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [restaurantId]);

  async function fetchRestaurantAndMenu() {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle(),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('category'),
      ]);

      if (restaurantRes.error) throw restaurantRes.error;
      if (menuRes.error) throw menuRes.error;

      setRestaurant(restaurantRes.data);
      setMenuItems(menuRes.data || []);

      const counts: Record<string, number> = {};
      menuRes.data?.forEach((item) => {
        counts[item.id] = 0;
      });
      setItemCounts(counts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateCount = (itemId: string, delta: number) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  const getPriceLevel = (level: number) => {
    return '$'.repeat(level);
  };

  const groupedItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  const selectedItems = menuItems.filter((item) => (itemCounts[item.id] || 0) > 0);
  const hasItems = selectedItems.length > 0;

  const handleViewOrder = () => {
    const orderData = selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: itemCounts[item.id],
    }));
    const queryString = encodeURIComponent(JSON.stringify(orderData));
    router.push(`/checkout/${restaurantId}?items=${queryString}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="h-96 bg-gray-200 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Restaurant not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="relative h-96 w-full overflow-hidden">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {restaurant.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-semibold text-gray-900">
                {restaurant.rating}
              </span>
              <span className="text-gray-500">(Rating)</span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-medium text-orange-600">
                {getPriceLevel(restaurant.price_level)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{restaurant.delivery_time}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine_tags.map((tag, idx) => (
              <Badge
                key={idx}
                className="bg-orange-50 text-orange-700 border-orange-200 text-sm py-1"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-32">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Menu</h2>

          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No menu items available</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-orange-200">
                    {category}
                  </h3>

                  <div className="grid gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-orange-300 transition-colors"
                      >
                        <div className="flex gap-6 p-6">
                          <div className="flex-shrink-0 w-40 h-40 overflow-hidden rounded-lg">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <h4 className="text-xl font-bold text-gray-900">
                                    {item.name}
                                  </h4>
                                  <div className="flex gap-2 mt-2">
                                    {item.is_vegetarian && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                                      >
                                        Vegetarian
                                      </Badge>
                                    )}
                                    {item.is_spicy && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-red-50 text-red-700 border-red-200 text-xs"
                                      >
                                        Spicy
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-orange-600">
                                    ${item.price.toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              <p className="text-gray-600 text-sm">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => updateCount(item.id, -1)}
                                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors flex items-center justify-center"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-lg font-semibold text-gray-900">
                                  {itemCounts[item.id] || 0}
                                </span>
                                <button
                                  onClick={() => updateCount(item.id, 1)}
                                  className="w-10 h-10 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 font-semibold transition-colors flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-sm text-gray-600">
                                {itemCounts[item.id] > 0 && (
                                  <span className="font-semibold text-orange-600">
                                    ${(item.price * (itemCounts[item.id] || 0)).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {hasItems && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedItems.reduce((sum, item) => sum + (itemCounts[item.id] || 0), 0)}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${selectedItems.reduce((sum, item) => sum + item.price * (itemCounts[item.id] || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleViewOrder}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-semibold px-8 py-6 text-lg"
            >
              View Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
