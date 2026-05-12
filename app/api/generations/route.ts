import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const mode = searchParams.get('mode');
    const search = searchParams.get('search');

    let query = supabase
      .from('generations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (mode) {
      query = query.eq('strategy_mode', parseInt(mode));
    }

    if (search) {
      query = query.or(`topic.ilike.%${search}%,title.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      generations: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
