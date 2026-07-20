import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { secret, playerName, maxAttempts } = await request.json();
    
    if (!secret || isNaN(Number(secret))) {
      return NextResponse.json({ error: 'Invalid secret number' }, { status: 400 });
    }
    
    const attempts = maxAttempts ? parseInt(maxAttempts, 10) : 10;

    // Insert into Supabase
    const { data, error } = await supabase
      .from('games')
      .insert([
        { 
          secret_number: String(secret),
          game_status: 'waiting_player_2',
          total_attempts: 0,
          max_attempts: attempts,
          player_1_name: playerName || 'Player 1'
        }
      ])
      .select('id')
      .single();

    if (error || !data) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }

    return NextResponse.json({ gameId: data.id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('games')
    .select('id')
    .eq('id', gameId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  return NextResponse.json({ exists: true });
}


