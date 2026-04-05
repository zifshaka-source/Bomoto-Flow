'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Percent, Tag, Clock, Copy, Check } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  valid_until: string;
}

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountText = (offer: Offer) => {
    if (offer.discount_type === 'percentage') {
      return `${offer.discount_value}% OFF`;
    } else {
      return `₹${offer.discount_value} OFF`;
    }
  };

  if (loading) {
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
          <Percent className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Special Offers</h1>
            <p className="text-gray-600 mt-2">
              Save more on your favorite meals with our exclusive deals
            </p>
          </div>
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No active offers at the moment</p>
              <p className="text-gray-400 mb-6">
                Check back later for exciting deals!
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Browse Restaurants
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card
                key={offer.id}
                className="overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-xl"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {getDiscountText(offer)}
                    </Badge>
                    <Percent className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                </div>

                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4">{offer.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>
                        Min. order: <span className="font-semibold text-gray-900">₹{offer.min_order_value}</span>
                      </span>
                    </div>

                    {offer.max_discount && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Percent className="h-4 w-4" />
                        <span>
                          Max. discount: <span className="font-semibold text-gray-900">₹{offer.max_discount}</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        Valid till:{' '}
                        <span className="font-semibold text-gray-900">
                          {new Date(offer.valid_until).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Coupon Code</p>
                        <p className="text-xl font-bold text-orange-600">{offer.code}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCode(offer.code)}
                        className="gap-2"
                      >
                        {copiedCode === offer.code ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/')}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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
