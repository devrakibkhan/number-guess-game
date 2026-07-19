import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { gameId, hint } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (!['more', 'less', 'correct'].includes(hint)) {
      return NextResponse.json({ error: 'Invalid hint' }, { status: 400 });
    }

    // Update the game record with the hint provided by Player 1
    const { error: updateError } = await supabase
      .from('games')
      .update({ hint: hint })
      .eq('id', gameId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: 'Failed to update game state' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
