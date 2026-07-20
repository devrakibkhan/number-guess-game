import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { gameId, isHost, hint, nextGuess } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (!['more', 'less', 'correct'].includes(hint)) {
      return NextResponse.json({ error: 'Invalid hint' }, { status: 400 });
    }

    // Fetch current game state to get total_attempts
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('total_attempts, game_status, max_attempts')
      .eq('id', gameId)
      .single();

    if (fetchError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    let updateData: any = {};
    let currentAttempts = game.total_attempts || 0;
    const MAX_ATTEMPTS = game.max_attempts || 10;

    if (isHost) {
      // Player 1's turn
      if (game.game_status !== 'player_1_turn') {
        return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
      }

      if (hint === 'correct') {
        updateData.hint = hint;
        updateData.game_status = 'player_2_won';
        updateData.ended_at = new Date().toISOString();
      } else {
        if (!nextGuess || isNaN(Number(nextGuess))) {
          return NextResponse.json({ error: 'Invalid guess' }, { status: 400 });
        }
        updateData.hint = hint;
        updateData.player_1_current_guess = String(nextGuess);
        updateData.game_status = 'player_2_turn';
      }
    } else {
      // Player 2's turn
      if (game.game_status !== 'player_2_turn') {
        return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
      }

      if (hint === 'correct') {
        updateData.player_2_hint = hint;
        updateData.game_status = 'player_1_won';
        updateData.ended_at = new Date().toISOString();
      } else {
        if (!nextGuess || isNaN(Number(nextGuess))) {
          return NextResponse.json({ error: 'Invalid guess' }, { status: 400 });
        }
        
        currentAttempts += 1;
        updateData.player_2_hint = hint;
        updateData.current_guess = String(nextGuess);
        
        if (currentAttempts >= MAX_ATTEMPTS) {
          updateData.game_status = 'draw';
          updateData.ended_at = new Date().toISOString();
        } else {
          updateData.game_status = 'player_1_turn';
        }
        updateData.total_attempts = currentAttempts;
      }
    }

    const { error: updateError } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: 'Failed to update game state' }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: updateData.game_status });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
