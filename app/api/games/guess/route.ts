import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { gameId, guess } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (!guess || guess.length !== 4) {
      return NextResponse.json({ error: 'Invalid guess. Must be 4 digits.' }, { status: 400 });
    }

    // Fetch the secret from Supabase
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('id, secret_number')
      .eq('game_id', gameId)
      .single();

    if (fetchError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const secretNum = parseInt(game.secret_number, 10);
    const guessNum = parseInt(guess, 10);
    let hint = '';
    let result = '';

    if (guessNum === secretNum) {
      hint = 'correct';
      result = 'correct';
    } else if (guessNum < secretNum) {
      hint = 'more';
      result = 'too_low';
    } else {
      hint = 'less';
      result = 'too_high';
    }

    // Update the game record with the guess and hint
    const { error: updateError } = await supabase
      .from('games')
      .update({ current_guess: guess, hint: hint })
      .eq('id', game.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: 'Failed to update game state' }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
