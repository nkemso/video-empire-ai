import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initializePayment } from '@/lib/paystack';
import { SUBSCRIPTION_PLANS } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await request.json();
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    
    if (!plan || plan.tier === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const result = await initializePayment({
      email: user.email!,
      amount: plan.price_ngn * 100, // Convert to kobo
      metadata: {
        user_id: user.id,
        tier: plan.tier,
        provider: 'paystack',
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paystack/verify`,
    });

    return NextResponse.json({
      authorization_url: result.authorization_url,
      reference: result.reference,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
