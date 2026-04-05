'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Smartphone, CreditCard, Wallet } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface RestaurantInfo {
  name: string;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [items, setItems] = useState<OrderItem[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    deliveryAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');

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
        .select('name')
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 2.99;
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + deliveryFee + tax;

  const isFormValid =
    formData.fullName.trim() &&
    formData.phoneNumber.trim() &&
    formData.deliveryAddress.trim();

  const handlePayment = async () => {
    if (!isFormValid) return;

    setSubmitting(true);

    try {
      const orderData = {
        restaurant_id: restaurantId,
        customer_name: formData.fullName,
        phone_number: formData.phoneNumber,
        delivery_address: formData.deliveryAddress,
        order_items: items,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total_amount: totalAmount,
        payment_method: paymentMethod.toUpperCase(),
        order_status: 'confirmed',
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) throw error;

      const orderId = data?.[0]?.id;

      setTimeout(() => {
        router.push(`/order-confirmation/${orderId}`);
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Details</h1>
          <p className="text-gray-600">Complete your order from {restaurant?.name}</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-orange-200">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 space-y-3">
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
              <div className="pt-3 border-t-2 border-orange-200 flex justify-between">
                <span className="text-xl font-bold text-gray-900">Grand Total</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-orange-200">
              Delivery Address
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Delivery Address
                </label>
                <Textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your complete delivery address"
                  className="min-h-24 border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-orange-200">
              Payment Method
            </h2>

            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors" onClick={() => setPaymentMethod('upi')}>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                  className="w-5 h-5 text-orange-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-gray-900">UPI</span>
                  </div>
                  <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors" onClick={() => setPaymentMethod('card')}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                  className="w-5 h-5 text-orange-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                  </div>
                  <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors" onClick={() => setPaymentMethod('cod')}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                  className="w-5 h-5 text-orange-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-gray-900">Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600">Pay when your order arrives</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-6 flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1 py-3 text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!isFormValid || submitting}
            className={`flex-1 font-semibold py-3 text-base ${
              submitting
                ? 'opacity-70 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
            }`}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : paymentMethod === 'cod' ? (
              'Place Order'
            ) : (
              'Pay Now'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
