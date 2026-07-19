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
  const [feedbackColor, setFeedbackColor] = useState("var(--on-surface-variant)");
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
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          const { current_guess, hint } = payload.new;
          if (current_guess && hint) {
            setAttempts((prev) => prev + 1);
            if (hint === 'correct') {
              setFeedback(`Player guessed ${current_guess}: Access Granted!`);
              setFeedbackColor("var(--success)");
              setHasWon(true);
            } else if (hint === 'more') {
              setFeedback(`Player guessed ${current_guess}: Too low! Shift higher.`);
              setFeedbackColor("var(--error)");
            } else if (hint === 'less') {
              setFeedback(`Player guessed ${current_guess}: Too high! Shift lower.`);
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
    if (!guess || guess.length !== 4) return;
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
      // Note: We don't update attempts/feedback immediately here if we want to rely on the Realtime event.
      // But since Realtime handles it, the UI will update for both players via the subscription!
      setGuess("");
    } catch (err) {
      setFeedback("Failed to submit guess.");
      setFeedbackColor("var(--error)");
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>INITIALIZING LINK...</div>;
  }

  if (error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--error)' }}>{error}</div>;
  }

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>grid_view</span>
          <h1 className="app-title">CIPHER_SHIFT</h1>
        </div>
        {isHost && (
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '12px' }}>
            HOST VIEW
          </div>
        )}
      </header>

      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
        <div className="glass-card entrance-anim delay-1" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }} className="entrance-anim delay-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse-neon 2s infinite' }}></div>
            <span style={{ color: 'var(--success)', fontWeight: 'bold', letterSpacing: '0.1em' }}>GAME ACTIVE</span>
          </div>

          {isHost && !hasWon && (
             <div className="entrance-anim" style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>Share this link with Player 2:</p>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', wordBreak: 'break-all', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <a href={`${window.location.origin}/game/${gameId}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{`${window.location.origin}/game/${gameId}`}</a>
                </div>
                <button className="btn-primary" style={{ height: '48px', fontSize: '16px', animation: 'none' }} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/game/${gameId}`)}>
                  COPY LINK
                </button>
             </div>
          )}

          <div className="entrance-anim delay-3" style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', color: 'var(--on-surface-variant)', letterSpacing: '0.1em', marginBottom: '8px' }}>ATTEMPT</div>
            <div style={{ fontSize: '48px', fontFamily: 'var(--font-headline)', color: 'var(--on-surface)', fontWeight: 800 }}>{String(attempts).padStart(2, '0')}</div>
          </div>

          <div className="space-y-stack-md entrance-anim delay-4">
            {!isHost && (
              <input
                className="input-field"
                maxLength={4}
                placeholder="••••"
                type="password"
                value={guess}
                onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
                style={{ marginBottom: '8px' }}
                disabled={hasWon}
              />
            )}
            
            <div style={{ height: '24px', marginBottom: '32px', color: feedbackColor, fontWeight: 'bold', fontSize: '14px', transition: 'color 0.3s' }}>
              {feedback || (isHost ? "Waiting for Player 2..." : "")}
            </div>
            
            {!hasWon ? (
              !isHost && (
                <button className="btn-primary" onClick={handleSubmitGuess} disabled={guess.length !== 4}>
                  <span>SUBMIT GUESS</span>
                  <span className="material-symbols-outlined">send</span>
                </button>
              )
            ) : (
              <button className="btn-primary" onClick={() => router.push('/')} style={{ background: 'var(--success)', color: '#000', boxShadow: 'none' }}>
                <span>PLAY AGAIN</span>
                <span className="material-symbols-outlined">replay</span>
              </button>
            )}
          </div>
        </div>
      </main>
      
      {/* Background shader representation using CSS */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 50% 50%, #2f0b3a 0%, #111318 100%)', opacity: 0.8 }}></div>
    </>
  );
}
