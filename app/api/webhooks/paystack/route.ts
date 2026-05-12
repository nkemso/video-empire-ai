import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');
    
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success':
        await handlePaystackChargeSuccess(event.data);
        break;
      case 'subscription.create':
        await handlePaystackSubscriptionCreate(event.data);
        break;
      case 'subscription.disable':
        await handlePaystackSubscriptionDisable(event.data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handlePaystackChargeSuccess(data: any) {
  const userId = data.metadata?.user_id;
  const tier = data.metadata?.tier;

  if (!userId || !tier) return;

  // Save payment
  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    provider: 'paystack',
    provider_payment_id: data.id.toString(),
    provider_reference: data.reference,
    amount: data.amount / 100,
    currency: data.currency,
    payment_method: data.channel,
    status: 'success',
    paid_at: data.paid_at,
    metadata: data,
  });

  // Update profile
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_provider: 'paystack',
      subscription_started_at: new Date().toISOString(),
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId);
}

async function handlePaystackSubscriptionCreate(data: any) {
  // Handle subscription creation
  console.log('Paystack subscription created:', data);
}

async function handlePaystackSubscriptionDisable(data: any) {
  // Handle subscription cancellation
  const customerEmail = data.customer.email;
  
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'cancelled',
      })
      .eq('id', profile.id);
  }
}
