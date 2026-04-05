'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase, Restaurant } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Clock, MapPin } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface RestaurantInfo {
  name: string;
  delivery_time: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [items, setItems] = useState<OrderItem[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const decodedItems = JSON.parse(decodeURIComponent(itemsParam));
        setItems(decodedItems);
      } catch (error) {
        console.error('Error parsing items:', error);
      }
    }

    fetchRestaurant();
  }, [searchParams, restaurantId]);

  async function fetchRestaurant() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name, delivery_time')
        .eq('id', restaurantId)
        .maybeSingle();

      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 2.99;
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
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

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Summary</h1>
          <p className="text-gray-600">Review your order before payment</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-orange-200">
            {restaurant?.name}
          </h2>

          <div className="flex gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="font-medium">{restaurant?.delivery_time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Truck className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Home</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-6">Items</h3>

          <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    Qty: <span className="font-medium">{item.quantity}</span> × ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span className="font-medium">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (10%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t-2 border-orange-200 flex justify-between">
              <span className="text-xl font-bold text-gray-900">Grand Total</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Note:</span> Payment processing will be handled securely at the next step.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6 flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 py-3 text-base"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => {
              const itemsParam = searchParams.get('items');
              router.push(`/payment/${restaurantId}?items=${itemsParam}`);
            }}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-semibold py-3 text-base"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
