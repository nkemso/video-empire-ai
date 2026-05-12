import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateContent } from '@/lib/gemini';
import { getStrategyPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { topic, mode, audience, platform, tone } = body;

    // 3. Validate input
    if (!topic || typeof topic !== 'string' || topic.length < 3) {
      return NextResponse.json(
        { error: 'Topic must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    if (!mode || mode < 1 || mode > 5) {
      return NextResponse.json(
        { error: 'Strategy mode must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // 4. Check rate limit
    const { data: canGenerate, error: limitError } = await supabaseAdmin
      .rpc('can_user_generate', { user_uuid: user.id });

    if (limitError) {
      console.error('Rate limit check failed:', limitError);
      return NextResponse.json(
        { error: 'Failed to check usage limit.' },
        { status: 500 }
      );
    }

    if (!canGenerate) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      const tier = profile?.subscription_tier || 'free';
      
      return NextResponse.json(
        { 
          error: 'Generation limit reached.',
          message: tier === 'free' 
            ? 'Free tier: 3 generations per day. Upgrade to Pro for 100/month.'
            : 'Monthly limit reached. Upgrade to Agency for unlimited.',
          upgrade_required: true,
          current_tier: tier
        },
        { status: 429 }
      );
    }

    // 5. Generate content with AI
    const prompt = getStrategyPrompt(mode, topic, { audience, platform, tone });
    const { content, tokensUsed, generationTimeMs } = await generateContent(prompt);

    // 6. Extract title from content
    const titleMatch = content.match(/^#+ (.+?)$/m);
    const title = titleMatch ? titleMatch[1] : `${getModeName(mode)} Strategy: ${topic}`;

    // 7. Save to database
    const { data: generation, error: saveError } = await supabaseAdmin
      .from('generations')
      .insert({
        user_id: user.id,
        topic,
        strategy_mode: mode,
        target_audience: audience,
        platform,
        tone,
        title,
        content,
        ai_provider: 'gemini',
        model_used: 'gemini-1.5-flash',
        tokens_used: tokensUsed,
        generation_time_ms: generationTimeMs,
        status: 'completed'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Save generation failed:', saveError);
      return NextResponse.json(
        { error: 'Failed to save generation.' },
        { status: 500 }
      );
    }

    // 8. Update user stats
    await supabaseAdmin
      .from('profiles')
      .update({
        last_generation_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // 9. Log usage
    await supabaseAdmin
      .from('usage_logs')
      .insert({
        user_id: user.id,
        action: 'generate_content',
        resource_type: 'generation',
        resource_id: generation.id,
        metadata: {
          mode,
          tokens: tokensUsed,
          time_ms: generationTimeMs
        }
      });

    // 10. Get remaining generations
    const { data: remaining } = await supabaseAdmin
      .rpc('get_remaining_generations', { user_uuid: user.id });

    // 11. Return success
    return NextResponse.json({
      success: true,
      generation: {
        id: generation.id,
        title: generation.title,
        content: generation.content,
        mode: generation.strategy_mode,
        topic: generation.topic,
        created_at: generation.created_at,
      },
      usage: {
        remaining: remaining,
        tokens_used: tokensUsed,
        generation_time_ms: generationTimeMs
      }
    });

  } catch (error: any) {
    console.error('Generation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function getModeName(mode: number): string {
  const names = {
    1: 'Revenue Capture',
    2: 'YouTube Automation',
    3: 'Viral Shorts',
    4: 'Authority Brand',
    5: 'Full Empire'
  };
  return names[mode as keyof typeof names] || 'Strategy';
}
