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

  // New state variables for the manual hint flow
  const [currentGuessState, setCurrentGuessState] = useState("");
  const [hintState, setHintState] = useState("");

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
          
          if (current_guess) setCurrentGuessState(current_guess);
          if (hint) setHintState(hint);

          if (hint === 'pending') {
            if (!isHost) {
              setFeedback("Waiting for Player 1 to respond...");
              setFeedbackColor("var(--foreground)");
            } else {
              setFeedback("Player 2 has made a guess!");
              setFeedbackColor("var(--primary)");
            }
          } else if (hint === 'correct') {
            if (!isHost) setAttempts((prev) => prev + 1);
            setFeedback(isHost ? "You indicated CORRECT!" : `Player 1 says ${current_guess} is Correct!`);
            setFeedbackColor("var(--success)");
            setHasWon(true);
          } else if (hint === 'more') {
            if (!isHost) setAttempts((prev) => prev + 1);
            setFeedback(isHost ? "You indicated MORE." : `Player 1 says ${current_guess} is too low! Guess MORE.`);
            setFeedbackColor("var(--error)");
          } else if (hint === 'less') {
            if (!isHost) setAttempts((prev) => prev + 1);
            setFeedback(isHost ? "You indicated LESS." : `Player 1 says ${current_guess} is too high! Guess LESS.`);
            setFeedbackColor("var(--error)");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, isHost]);

  const handleSubmitGuess = async () => {
    if (!guess || isNaN(Number(guess))) return;
    if (isHost) return; 

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
      } else {
        setFeedback("Waiting for Player 1 to respond...");
        setFeedbackColor("var(--foreground)");
        setHintState('pending');
        setCurrentGuessState(guess);
      }
      setGuess("");
    } catch (err) {
      setFeedback("Failed to submit guess.");
      setFeedbackColor("var(--error)");
    }
  };

  const handleSendHint = async (hintResponse: string) => {
    try {
      const response = await fetch('/api/games/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, hint: hintResponse })
      });
      const data = await response.json();

      if (data.error) {
        setFeedback(data.error);
        setFeedbackColor("var(--error)");
      }
    } catch (err) {
      setFeedback("Failed to send hint.");
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

          {!isHost && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--foreground)', opacity: 0.6, marginBottom: '0.25rem' }}>ATTEMPT</div>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--foreground)' }}>{attempts}</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isHost && (
              <input
                className="input-field"
                placeholder="Enter guess..."
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
                disabled={hasWon || hintState === 'pending'}
              />
            )}
            
            <div style={{ minHeight: '1.5rem', color: feedbackColor, fontWeight: 600, fontSize: '1rem' }}>
              {feedback || (isHost ? "Waiting for Player 2 to guess..." : "")}
            </div>

            {/* Host Hint Controls */}
            {isHost && hintState === 'pending' && currentGuessState && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Player 2 guessed: {currentGuessState}</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }} onClick={() => handleSendHint('less')}>
                    Less
                  </button>
                  <button className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }} onClick={() => handleSendHint('more')}>
                    More
                  </button>
                  <button className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '1rem', background: 'var(--success)' }} onClick={() => handleSendHint('correct')}>
                    Correct
                  </button>
                </div>
              </div>
            )}
            
            {!hasWon ? (
              !isHost && (
                <button className="btn-primary" onClick={handleSubmitGuess} disabled={!guess || hintState === 'pending'}>
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
