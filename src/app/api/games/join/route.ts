import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { gameId, player2Secret, currentGuess, player2Name } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (!player2Secret || isNaN(Number(player2Secret))) {
      return NextResponse.json({ error: 'Invalid secret number.' }, { status: 400 });
    }

    if (!currentGuess || isNaN(Number(currentGuess))) {
      return NextResponse.json({ error: 'Invalid guess.' }, { status: 400 });
    }

    // Update the game record with Player 2's secret, their first guess, and set turn
    const { error: updateError } = await supabase
      .from('games')
      .update({ 
        player_2_secret_number: String(player2Secret),
        current_guess: String(currentGuess),
        game_status: 'player_1_turn',
        player_2_name: player2Name || 'Player 2',
        started_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .eq('game_status', 'waiting_player_2'); // Ensure it's in the correct state

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: 'Failed to join game or game already active.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
