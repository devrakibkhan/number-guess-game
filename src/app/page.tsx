"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [secret, setSecret] = useState("");
  const router = useRouter();

  const handleStartGame = async () => {
    if (!secret || isNaN(Number(secret))) {
      alert("Please enter a valid secret number.");
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
        <h1 className="app-title">Number Guessing Game</h1>
      </header>

      <main style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Player 1: Set the Secret
          </h2>
          <p style={{ color: 'var(--foreground)', opacity: 0.8, fontSize: '0.875rem', marginBottom: '2rem' }}>
            Choose a secret number for Player 2 to guess.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              className="input-field"
              placeholder="e.g. 42"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value.replace(/\D/g, ''))}
            />
            <div style={{ textAlign: 'left', color: 'var(--foreground)', opacity: 0.6, fontSize: '0.75rem', marginBottom: '1rem' }}>
              NUMBERS ONLY
            </div>
            
            <button className="btn-primary" onClick={handleStartGame}>
              Start Game
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
