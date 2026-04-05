'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Package, Clock, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';

interface Order {
  id: string;
  restaurant_id: string;
  total_amount: number;
  order_status: string;
  created_at: string;
  order_items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface Restaurant {
  name: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Record<string, Restaurant>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  async function fetchOrders() {
    if (!user) return;

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      const restaurantIds = Array.from(new Set(ordersData?.map((o) => o.restaurant_id) || []));
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name')
        .in('id', restaurantIds);

      if (restaurantsError) throw restaurantsError;

      const restaurantsMap: Record<string, Restaurant> = {};
      restaurantsData?.forEach((r) => {
        restaurantsMap[r.id] = r;
      });
      setRestaurants(restaurantsMap);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'preparing':
        return <Package className="h-5 w-5 text-orange-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
        <div className="max-w-4xl mx-auto px-4 py-4">
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

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No orders yet</p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Start Ordering
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {restaurants[order.restaurant_id]?.name || 'Restaurant'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.order_status)}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.order_status)}
                        {order.order_status}
                      </div>
                    </Badge>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Items:</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/order-confirmation/${order.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    {order.order_status.toLowerCase() === 'delivered' && (
                      <Button
                        onClick={() => router.push(`/restaurant/${order.restaurant_id}`)}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
