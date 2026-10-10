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

// Fetch all comments (For Admin Portal)
export async function GET() {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase env variables missing' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// Post a new comment
export async function POST(req: Request) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase env variables missing' }, { status: 500 });
  }

  try {
    const { questionId, voterId, commentText } = await req.json();

    if (!commentText || commentText.trim() === '') {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ question_id: questionId, voter_id: voterId, comment_text: commentText }])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}