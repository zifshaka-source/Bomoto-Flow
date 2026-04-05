'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, Clock, Truck, MapPin, Phone } from 'lucide-react';

interface Order {
  id: string;
  restaurant_id: string;
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  order_items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total_amount: number;
  payment_method: string;
  order_status: string;
  created_at: string;
}

interface RestaurantInfo {
  name: string;
  rating: number;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  async function fetchOrderDetails() {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      setOrder(orderData);

      if (orderData) {
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('name, rating')
          .eq('id', orderData.restaurant_id)
          .maybeSingle();

        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Order not found</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const estimatedDeliveryTime = new Date(new Date().getTime() + 45 * 60000);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle className="h-24 w-24 text-green-500" />
              <div className="absolute inset-0 animate-ping opacity-75">
                <CheckCircle className="h-24 w-24 text-green-500" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg mb-2">
            Thank you for your order. Your delicious food is being prepared.
          </p>
          <p className="text-gray-500">
            Order ID: <span className="font-mono font-semibold text-gray-900">{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Delivery Time</p>
            <p className="font-bold text-gray-900">
              {estimatedDeliveryTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <Truck className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="font-bold text-gray-900 capitalize">{order.order_status}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              ${order.total_amount.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Total Amount</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-orange-200">
            Order Details
          </h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">From {restaurant?.name}</h3>
            <div className="space-y-3">
              {order.order_items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 space-y-3 mb-8">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span className="font-medium">${order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax</span>
              <span className="font-medium">${order.tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t-2 border-orange-200 flex justify-between">
              <span className="text-xl font-bold text-gray-900">Grand Total</span>
              <span className="text-2xl font-bold text-orange-600">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Payment Method:</span> {order.payment_method}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-orange-200">
            Delivery Address
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Address</p>
                <p className="text-gray-700">{order.delivery_address}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Contact</p>
                <p className="text-gray-700">{order.customer_name}</p>
                <p className="text-gray-700">{order.phone_number}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => router.push('/')}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-semibold py-3 text-base"
          >
            Order More
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex-1 py-3 text-base"
          >
            Back Home
          </Button>
        </div>
      </main>
    </div>
  );
}
