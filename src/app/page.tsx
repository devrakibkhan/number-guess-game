"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { styled, globalStyles } from "@/stitches.config";
import { playClickSound } from "@/lib/sounds";

const Container = styled('div', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',
  backgroundColor: '$background',
});

const Header = styled('header', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '$4',
  textAlign: 'center',
});

const Title = styled('h1', {
  fontSize: '$5',
  fontWeight: 'bold',
  background: 'linear-gradient(to right, $primary, #93c5fd)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const Card = styled('div', {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '$3',
  padding: '$5',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '$base',
  textAlign: 'center',
});

const CardTitle = styled('h2', {
  fontSize: '$4',
  marginBottom: '$1',
});

const CardSubtitle = styled('p', {
  color: '$foreground',
  opacity: 0.8,
  fontSize: '$2',
  marginBottom: '$4',
});

const Input = styled('input', {
  width: '100%',
  padding: '$3',
  borderRadius: '$2',
  border: '1px solid $border',
  backgroundColor: '$backgroundSubtle',
  color: '$foreground',
  fontSize: '$3',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&:focus': {
    borderColor: '$primary',
  }
});

const Button = styled('button', {
  backgroundColor: '$primary',
  color: '#fff',
  padding: '$3 $5',
  borderRadius: '$2',
  fontSize: '$3',
  fontWeight: 'bold',
  width: '100%',
  marginTop: '$4',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '$primaryHover',
    transform: 'translateY(-2px)',
    boxShadow: '$glow',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  }
});

const ModalOverlay = styled('div', {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.8)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '$4',
});

const ModalContent = styled('div', {
  backgroundColor: '$background',
  padding: '$5',
  borderRadius: '$3',
  border: '1px solid $border',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '$glow',
});

const ModalTitle = styled('h3', {
  fontSize: '$5',
  marginBottom: '$3',
  color: '$primary',
});

const ModalText = styled('div', {
  fontSize: '$3',
  lineHeight: 1.6,
  marginBottom: '$4',
  color: '$foreground',
  opacity: 0.9,
  '& ul': {
    paddingLeft: '$4',
    marginTop: '$2',
  },
  '& li': {
    marginBottom: '$2',
  }
});

export default function Home() {
  globalStyles();
  const [secret, setSecret] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("hasVisitedTwoWayGame");
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    playClickSound();
    localStorage.setItem("hasVisitedTwoWayGame", "true");
    setShowWelcome(false);
  };

  const handleStartGame = async () => {
    playClickSound();
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
      router.push(`/game/${data.gameId}?host=true`);
    } else {
      alert("Failed to create game.");
    }
  };

  return (
    <Container>
      <Header>
        <Title>Two-Way Number Guessing</Title>
      </Header>

      <Card>
        <CardTitle>Player 1: Set Your Secret</CardTitle>
        <CardSubtitle>Choose a secret number for Player 2 to guess. You will also guess theirs!</CardSubtitle>

        <Input
          placeholder="e.g. 42"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value.replace(/\D/g, ''))}
        />
        <div style={{ textAlign: 'left', color: 'var(--foreground)', opacity: 0.6, fontSize: '12px', marginTop: '4px' }}>
          NUMBERS ONLY
        </div>
        
        <Button onClick={handleStartGame} disabled={!secret}>
          Create Game
        </Button>
      </Card>

      {showWelcome && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Welcome to the Two-Way Number Guessing Game!</ModalTitle>
            <ModalText>
              <p>This is a fast-paced, simultaneous guessing game for two players.</p>
              <ul>
                <li><strong>Set your secret:</strong> Both players start by picking a secret number.</li>
                <li><strong>Guess & Hint:</strong> On your turn, you provide a hint (Less, More, or Correct) for your opponent's previous guess.</li>
                <li><strong>Simultaneous:</strong> In the same turn, you make your <em>next guess</em> for their secret!</li>
                <li><strong>Win:</strong> The first person to accurately guess the opponent's secret wins! If 10 turns pass, it's a draw.</li>
              </ul>
            </ModalText>
            <Button onClick={closeWelcome}>Got it, let's play!</Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
