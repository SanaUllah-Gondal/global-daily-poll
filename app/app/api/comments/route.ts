import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const { questionId, voterId, commentText } = await req.json();

    if (!commentText || commentText.trim() === '') {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    // Agar Supabase configured hai to database me save karein
    if (supabase) {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ question_id: questionId, voter_id: voterId, comment_text: commentText }]);

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      console.log('Local comment received (No Supabase connected):', { questionId, voterId, commentText });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return NextResponse.json([]);

    const { data } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json([]);
  }
}