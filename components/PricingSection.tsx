'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/types/database';
import toast from 'react-hot-toast';

export default function PricingSection() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');

  const handleSubscribe = async (tier: 'pro' | 'agency') => {
    setLoading(tier);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/signup');
        return;
      }

      if (currency === 'NGN') {
        // Use Paystack for Naira
        const res = await fetch('/api/payments/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier }),
        });
        const data = await res.json();
        
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        }
      } else {
        // Use LemonSqueezy for USD
        const variantId = tier === 'pro' 
          ? process.env.NEXT_PUBLIC_LEMON_PRO_VARIANT_ID
          : process.env.NEXT_PUBLIC_LEMON_AGENCY_VARIANT_ID;

        const res = await fetch('/api/payments/lemonsqueezy/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId, tier }),
        });
        const data = await res.json();
        
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="badge-gold mb-4 inline-flex">Pricing</div>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Choose Your <span className="gradient-text">Empire</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start free. Scale as you grow. Cancel anytime.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex bg-empire-charcoal rounded-full p-1 border border-white/10">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-6 py-2 rounded-full transition-all ${
                currency === 'USD' ? 'bg-empire-gold text-empire-black font-semibold' : 'text-gray-400'
              }`}
            >
              🌍 USD (Global)
            </button>
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-6 py-2 rounded-full transition-all ${
                currency === 'NGN' ? 'bg-empire-gold text-empire-black font-semibold' : 'text-gray-400'
              }`}
            >
              🇳🇬 NGN (Nigeria)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const price = currency === 'USD' ? plan.price_usd : plan.price_ngn;
            const isFeatured = plan.tier === 'pro';
            
            return (
              <div
                key={plan.tier}
                className={`premium-card relative ${
                  isFeatured ? 'ring-2 ring-empire-gold scale-105' : ''
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-gold flex items-center gap-1">
                    <Crown className="w-3 h-3" /> MOST POPULAR
                  </div>
                )}

                <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-5xl font-display font-black gradient-text">
                    {currency === 'USD' ? '$' : '₦'}
                    {price.toLocaleString()}
                  </span>
                  {price > 0 && <span className="text-gray-400">/month</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-empire-gold flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.tier === 'free' ? (
                  <button
                    onClick={() => router.push('/signup')}
                    className="w-full py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Get Started Free
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.tier as 'pro' | 'agency')}
                    disabled={loading === plan.tier}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isFeatured
                        ? 'bg-gradient-to-r from-empire-gold to-empire-gold-dark text-empire-black hover:scale-105'
                        : 'border border-empire-gold text-empire-gold hover:bg-empire-gold/10'
                    }`}
                  >
                    {loading === plan.tier ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          💳 Secure payments via Paystack (NGN) & LemonSqueezy (USD) • Cancel anytime
        </p>
      </div>
    </section>
  );
  }
