import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckout } from '@/lib/lemonsqueezy';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { variantId, tier } = await request.json();

    const checkoutUrl = await createCheckout({
      variantId,
      email: user.email!,
      userId: user.id,
      customData: { tier },
    });

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
