"use client";
import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("var(--foreground)");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    // Check if game exists
    const checkGame = async () => {
      try {
        const response = await fetch(`/api/games?gameId=${gameId}`);
        if (!response.ok) {
          setError("Game not found or has expired.");
        }
      } catch (err) {
        setError("Error checking game.");
      } finally {
        setLoading(false);
      }
    };
    checkGame();

    // Subscribe to realtime updates for this game
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          const { current_guess, hint } = payload.new;
          if (current_guess && hint) {
            setAttempts((prev) => prev + 1);
            if (hint === 'correct') {
              setFeedback(`Player guessed ${current_guess}: Correct!`);
              setFeedbackColor("var(--success)");
              setHasWon(true);
            } else if (hint === 'more') {
              setFeedback(`Player guessed ${current_guess}: Too low! Guess higher.`);
              setFeedbackColor("var(--error)");
            } else if (hint === 'less') {
              setFeedback(`Player guessed ${current_guess}: Too high! Guess lower.`);
              setFeedbackColor("var(--error)");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleSubmitGuess = async () => {
    if (!guess || isNaN(Number(guess))) return;
    if (isHost) return; // Host shouldn't guess

    try {
      const response = await fetch('/api/games/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, guess })
      });
      const data = await response.json();

      if (data.error) {
        setFeedback(data.error);
        setFeedbackColor("var(--error)");
      }
      setGuess("");
    } catch (err) {
      setFeedback("Failed to submit guess.");
      setFeedbackColor("var(--error)");
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Loading game...</div>;
  }

  if (error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--error)' }}>{error}</div>;
  }

  return (
    <>
      <header className="header">
        <h1 className="app-title">Number Guessing Game</h1>
        {isHost && (
          <div style={{ padding: '4px 8px', background: 'var(--border)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
            HOST VIEW
          </div>
        )}
      </header>

      <main style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          
          {isHost && !hasWon && (
             <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', opacity: 0.8, marginBottom: '0.5rem' }}>Share this link with Player 2:</p>
                <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: '8px', wordBreak: 'break-all', marginBottom: '1rem', border: `1px solid var(--border)` }}>
                  <a href={`${window.location.origin}/game/${gameId}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{`${window.location.origin}/game/${gameId}`}</a>
                </div>
                <button className="btn-primary" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/game/${gameId}`)}>
                  Copy Link
                </button>
             </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--foreground)', opacity: 0.6, marginBottom: '0.25rem' }}>ATTEMPT</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--foreground)' }}>{attempts}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isHost && (
              <input
                className="input-field"
                placeholder="Enter guess..."
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
                disabled={hasWon}
              />
            )}
            
            <div style={{ minHeight: '1.5rem', color: feedbackColor, fontWeight: 600, fontSize: '1rem' }}>
              {feedback || (isHost ? "Waiting for Player 2 to guess..." : "")}
            </div>
            
            {!hasWon ? (
              !isHost && (
                <button className="btn-primary" onClick={handleSubmitGuess} disabled={!guess}>
                  Submit Guess
                </button>
              )
            ) : (
              <button className="btn-primary" onClick={() => router.push('/')} style={{ background: 'var(--success)' }}>
                Play Again
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
