"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [secret, setSecret] = useState("");
  const router = useRouter();

  const handleStartGame = async () => {
    if (!secret || secret.length !== 4) {
      alert("Please enter a 4-digit secret number.");
      return;
    }

    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret })
    });
    const data = await response.json();
    
    if (data.gameId) {
      // Redirect host to the game page
      router.push(`/game/${data.gameId}?host=true`);
    } else {
      alert("Failed to create game.");
    }
  };

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>grid_view</span>
          <h1 className="app-title">CIPHER_SHIFT</h1>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
        <div className="glass-card entrance-anim delay-1" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }} className="entrance-anim delay-3">
            PLAYER 1: SET THE SECRET
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '32px' }} className="entrance-anim delay-3">
            Define the numerical cipher for your opponent to shift.
          </p>

          <div className="space-y-stack-md entrance-anim delay-4">
            <input
              className="input-field"
              maxLength={4}
              placeholder="••••"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value.replace(/\D/g, ''))}
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '12px', fontFamily: 'var(--font-body)', marginBottom: '32px' }}>
              <span>4 DIGITS</span>
              <span>NUMBERS ONLY</span>
            </div>
            
            <button className="btn-primary" onClick={handleStartGame}>
              <span>START GAME</span>
              <span className="material-symbols-outlined">play_arrow</span>
            </button>
          </div>
        </div>
      </main>
      
      {/* Background shader representation using CSS */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 50% 50%, #2f0b3a 0%, #111318 100%)', opacity: 0.8 }}></div>
    </>
  );
}
