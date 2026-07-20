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
      .select('total_attempts, game_status, max_attempts, hint, player_2_hint')
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

      const p1HasWon = game.player_2_hint === 'correct';
      updateData.hint = hint;

      if (!p1HasWon) {
        if (!nextGuess || isNaN(Number(nextGuess))) {
          return NextResponse.json({ error: 'Invalid guess' }, { status: 400 });
        }
        updateData.player_1_current_guess = String(nextGuess);
      }

      const nowP1Won = p1HasWon;
      const nowP2Won = hint === 'correct';

      if (nowP1Won && nowP2Won) {
        updateData.game_status = 'draw';
        updateData.ended_at = new Date().toISOString();
      } else {
        updateData.game_status = 'player_2_turn';
      }
    } else {
      // Player 2's turn
      if (game.game_status !== 'player_2_turn') {
        return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
      }

      const p2HasWon = game.hint === 'correct';
      updateData.player_2_hint = hint;
      
      currentAttempts += 1;
      updateData.total_attempts = currentAttempts;

      if (!p2HasWon) {
        if (!nextGuess || isNaN(Number(nextGuess))) {
          return NextResponse.json({ error: 'Invalid guess' }, { status: 400 });
        }
        updateData.current_guess = String(nextGuess);
      }

      const nowP1Won = hint === 'correct';
      const nowP2Won = p2HasWon;

      if (nowP1Won && nowP2Won) {
        updateData.game_status = 'draw';
        updateData.ended_at = new Date().toISOString();
      } else if (currentAttempts >= MAX_ATTEMPTS) {
        if (nowP1Won) updateData.game_status = 'player_1_won';
        else if (nowP2Won) updateData.game_status = 'player_2_won';
        else updateData.game_status = 'draw';
        updateData.ended_at = new Date().toISOString();
      } else {
        updateData.game_status = 'player_1_turn';
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
