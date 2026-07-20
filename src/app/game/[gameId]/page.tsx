"use client";
import { useState, useEffect, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { playClickSound, playTurnSound, playWinSound, playEndSound, playHintSound } from "@/lib/sounds";
import { styled, globalStyles } from "@/stitches.config";

const Container = styled('div', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$background',
});

const Header = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$4',
  borderBottom: '1px solid $border',
});

const Title = styled('h1', {
  fontSize: '$4',
  fontWeight: 'bold',
  background: 'linear-gradient(to right, $primary, #93c5fd)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
});

const Badge = styled('div', {
  display: 'inline-block',
  marginTop: '$1',
  padding: '4px 8px',
  borderRadius: '$1',
  fontSize: '10px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  variants: {
    role: {
      host: { background: '$border', color: '$foreground' },
      guest: { background: '$primary', color: '#fff' }
    }
  }
});

const Main = styled('main', {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',
});

const Card = styled('div', {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '$3',
  padding: '$5',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '$base',
});

const TopBar = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '$4',
  paddingBottom: '$3',
  borderBottom: '1px solid $border',
});

const Label = styled('div', {
  fontSize: '10px',
  color: '$foreground',
  opacity: 0.6,
  textTransform: 'uppercase',
  letterSpacing: '1px',
});

const Value = styled('div', {
  fontSize: '$5',
  fontWeight: 'bold',
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
  padding: '$3 $4',
  borderRadius: '$2',
  fontSize: '$3',
  fontWeight: 'bold',
  width: '100%',
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
  },
  variants: {
    variant: {
      outline: {
        backgroundColor: 'transparent',
        border: '1px solid $border',
        color: '$foreground',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.05)',
          boxShadow: 'none',
        }
      },
      dangerText: {
        backgroundColor: 'transparent',
        color: '$error',
        textDecoration: 'underline',
        padding: 0,
        width: 'auto',
        fontSize: '$2',
        '&:hover': {
          backgroundColor: 'transparent',
          color: '$errorHover',
          transform: 'none',
          boxShadow: 'none',
        }
      }
    }
  }
});

const HintBox = styled('div', {
  background: '$backgroundSubtle',
  padding: '$4',
  borderRadius: '$2',
  border: '1px solid $border',
  marginBottom: '$4',
  textAlign: 'center',
});

const FormGroup = styled('div', {
  marginBottom: '$4',
});

const FormLabel = styled('label', {
  fontSize: '$2',
  fontWeight: 'bold',
  display: 'block',
  marginBottom: '$2',
});

const HintButtons = styled('div', {
  display: 'flex',
  gap: '$2',
});

const HintButton = styled('button', {
  flex: 1,
  padding: '$3',
  borderRadius: '$2',
  border: '1px solid $border',
  backgroundColor: '$background',
  color: '$foreground',
  fontWeight: 'bold',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  variants: {
    active: {
      less: { backgroundColor: '$primary', color: '#fff', borderColor: '$primary' },
      more: { backgroundColor: '$primary', color: '#fff', borderColor: '$primary' },
      correct: { backgroundColor: '$success', color: '#fff', borderColor: '$success' },
    }
  }
});

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  globalStyles();
  const { gameId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  
  // Clock
  const [time, setTime] = useState(new Date());

  // Game State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [secretNumber, setSecretNumber] = useState("");
  const [player2Secret, setPlayer2Secret] = useState("");
  const [gameStatus, setGameStatus] = useState("");
  const [totalAttempts, setTotalAttempts] = useState(0);
  
  const [currentGuess, setCurrentGuess] = useState("");
  const [player1CurrentGuess, setPlayer1CurrentGuess] = useState("");
  const [hint, setHint] = useState("");
  const [player2Hint, setPlayer2Hint] = useState("");

  const prevStatusRef = useRef(gameStatus);

  // Input States
  const [joinSecret, setJoinSecret] = useState("");
  const [joinGuess, setJoinGuess] = useState("");
  const [turnGuess, setTurnGuess] = useState("");
  const [turnHint, setTurnHint] = useState<"less" | "more" | "correct" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();
          
        if (fetchError || !data) {
          setError("Game not found or has expired.");
        } else {
          setSecretNumber(data.secret_number || "");
          setPlayer2Secret(data.player_2_secret_number || "");
          setGameStatus(data.game_status || "waiting_player_2");
          setTotalAttempts(data.total_attempts || 0);
          setCurrentGuess(data.current_guess || "");
          setPlayer1CurrentGuess(data.player_1_current_guess || "");
          setHint(data.hint || "");
          setPlayer2Hint(data.player_2_hint || "");
          prevStatusRef.current = data.game_status || "waiting_player_2";
        }
      } catch (err) {
        setError("Error checking game.");
      } finally {
        setLoading(false);
      }
    };
    fetchGame();

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
          const newState = payload.new;
          if (newState.secret_number) setSecretNumber(newState.secret_number);
          if (newState.player_2_secret_number) setPlayer2Secret(newState.player_2_secret_number);
          if (newState.total_attempts !== undefined) setTotalAttempts(newState.total_attempts);
          if (newState.current_guess) setCurrentGuess(newState.current_guess);
          if (newState.player_1_current_guess) setPlayer1CurrentGuess(newState.player_1_current_guess);
          if (newState.hint) setHint(newState.hint);
          if (newState.player_2_hint) setPlayer2Hint(newState.player_2_hint);
          
          if (newState.game_status) {
            const newStatus = newState.game_status;
            setGameStatus(newStatus);
            
            if (newStatus !== prevStatusRef.current) {
               if (newStatus === 'player_1_won' || newStatus === 'player_2_won') {
                 playWinSound();
               } else if (newStatus === 'ended_manually' || newStatus === 'draw') {
                 playEndSound();
               }
               prevStatusRef.current = newStatus;
            }
          }

          setTurnGuess("");
          setTurnHint("");
        }
      )
      .on(
        'broadcast',
        { event: 'request_hint' },
        (payload) => {
           const sender = payload.payload.sender;
           if (sender !== (isHost ? 'host' : 'player2')) {
             playHintSound();
             alert("Your opponent is requesting a hint!");
           }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [gameId, isHost]);

  // REDIRECT TO REPORT ON GAME OVER
  useEffect(() => {
    const isGameOver = gameStatus === 'player_1_won' || gameStatus === 'player_2_won' || gameStatus === 'draw' || gameStatus === 'ended_manually';
    if (isGameOver) {
       router.push(`/report/${gameId}?host=${isHost}`);
    }
  }, [gameStatus, gameId, isHost, router]);


  const handleJoinGame = async () => {
    if (!joinSecret || !joinGuess) return;
    playClickSound();
    setSubmitting(true);
    try {
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, player2Secret: joinSecret, currentGuess: joinGuess })
      });
      const data = await response.json();
      if (data.error) alert(data.error);
      else playTurnSound();
    } catch (err) {
      alert("Failed to join.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTurnSubmit = async () => {
    playClickSound();
    if (!turnHint) {
      alert("Please provide a hint for the opponent's guess!");
      return;
    }
    if (turnHint !== 'correct' && !turnGuess) {
      alert("Please enter a guess for the opponent's secret!");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/games/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, isHost, hint: turnHint, nextGuess: turnGuess })
      });
      const data = await response.json();
      if (data.error) alert(data.error);
      else playTurnSound();
    } catch (err) {
      alert("Failed to submit turn.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndGame = async () => {
    playClickSound();
    if (!confirm("Are you sure you want to end the game?")) return;
    try {
      await fetch('/api/games/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });
    } catch(err) {
      alert("Failed to end game.");
    }
  };

  const handleRequestHint = async () => {
    playClickSound();
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'request_hint',
        payload: { sender: isHost ? 'host' : 'player2' }
      });
      alert("Hint requested!");
    }
  };

  const handleHintSelection = (h: "less" | "more" | "correct") => {
    playClickSound();
    setTurnHint(h);
  };

  if (loading) return <Container css={{justifyContent: 'center'}}><Title>Loading game...</Title></Container>;
  if (error) return <Container css={{justifyContent: 'center'}}><Title css={{color: '$error'}}>{error}</Title></Container>;

  const isGameOver = gameStatus === 'player_1_won' || gameStatus === 'player_2_won' || gameStatus === 'draw' || gameStatus === 'ended_manually';
  if (isGameOver) return <Container css={{justifyContent: 'center'}}><Title>Redirecting to report...</Title></Container>;

  const isMyTurn = (isHost && gameStatus === 'player_1_turn') || (!isHost && gameStatus === 'player_2_turn');

  return (
    <Container>
      <Header>
        <div>
          <Title>Two-Way Number Guessing</Title>
          <Badge role={isHost ? 'host' : 'guest'}>
            {isHost ? 'PLAYER 1 (HOST)' : 'PLAYER 2'}
          </Badge>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '20px', fontWeight: 700 }}>
             {time.toLocaleTimeString()}
           </div>
           <Button variant="dangerText" onClick={handleEndGame}>
             End Game
           </Button>
        </div>
      </Header>

      <Main>
        <Card>
          <TopBar>
            <div>
              <Label>Your Secret</Label>
              <Value>{isHost ? secretNumber : (player2Secret || "Not set")}</Value>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Label>Turn</Label>
              <Value>{totalAttempts} / 10</Value>
            </div>
          </TopBar>

          {gameStatus === 'waiting_player_2' && (
            <div style={{ textAlign: 'center' }}>
              {isHost ? (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Waiting for Player 2 to join...</h3>
                  <p style={{ fontSize: '14px', color: 'var(--foreground)', opacity: 0.8, marginBottom: '8px' }}>Share this link:</p>
                  <div style={{ padding: '12px', background: 'var(--background)', borderRadius: '8px', wordBreak: 'break-all', marginBottom: '16px', border: `1px solid var(--border)` }}>
                    <a href={`${window.location.origin}/game/${gameId}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{`${window.location.origin}/game/${gameId}`}</a>
                  </div>
                  <Button onClick={() => { playClickSound(); navigator.clipboard.writeText(`${window.location.origin}/game/${gameId}`); }}>
                    Copy Link
                  </Button>
                </div>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Join the Game</h3>
                  <FormGroup>
                    <FormLabel>Set your Secret Number</FormLabel>
                    <Input type="password" placeholder="e.g. 55" value={joinSecret} onChange={e => setJoinSecret(e.target.value.replace(/\D/g, ''))} disabled={submitting} />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Make your first guess of Player 1's secret</FormLabel>
                    <Input type="text" placeholder="e.g. 42" value={joinGuess} onChange={e => setJoinGuess(e.target.value.replace(/\D/g, ''))} disabled={submitting} />
                  </FormGroup>
                  <Button onClick={handleJoinGame} disabled={submitting || !joinSecret || !joinGuess}>
                    {submitting ? 'Joining...' : 'Join Game'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {gameStatus !== 'waiting_player_2' && (
            <div>
               {isMyTurn ? (
                  <div>
                    <HintBox>
                      <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Opponent guessed your secret is: <span style={{ fontSize: '24px', color: 'var(--primary)' }}>{isHost ? currentGuess : player1CurrentGuess}</span></h3>
                      {(isHost ? player2Hint : hint) && (
                        <div style={{ marginTop: '16px', color: (isHost ? player2Hint : hint) === 'correct' ? 'var(--success)' : 'var(--error)' }}>
                          Opponent said your previous guess was: <strong>{(isHost ? player2Hint : hint).toUpperCase()}</strong>
                        </div>
                      )}
                    </HintBox>
                    
                    <FormGroup>
                      <FormLabel>1. Hint for Opponent's guess:</FormLabel>
                      <HintButtons>
                        <HintButton active={turnHint === 'less' ? 'less' : undefined} onClick={() => handleHintSelection('less')}>Less</HintButton>
                        <HintButton active={turnHint === 'more' ? 'more' : undefined} onClick={() => handleHintSelection('more')}>More</HintButton>
                        <HintButton active={turnHint === 'correct' ? 'correct' : undefined} onClick={() => handleHintSelection('correct')}>Correct</HintButton>
                      </HintButtons>
                    </FormGroup>

                    {turnHint !== 'correct' && (
                      <FormGroup>
                         <FormLabel>2. Your guess for Opponent's secret:</FormLabel>
                         <div style={{ display: 'flex', gap: '8px' }}>
                           <Input style={{ flex: 1 }} type="text" placeholder="Enter next guess..." value={turnGuess} onChange={e => setTurnGuess(e.target.value.replace(/\D/g, ''))} disabled={submitting} />
                           <Button variant="outline" style={{ flex: '0 0 auto', width: 'auto' }} onClick={handleRequestHint}>Request Hint</Button>
                         </div>
                      </FormGroup>
                    )}
                    <Button onClick={handleTurnSubmit} disabled={submitting || !turnHint || (turnHint !== 'correct' && !turnGuess)} css={{marginTop: '$4'}}>
                      {submitting ? 'Submitting...' : 'Submit Turn'}
                    </Button>
                  </div>
               ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <h3 style={{ color: 'var(--foreground)', opacity: 0.8, marginBottom: '24px' }}>Waiting for Opponent to play their turn...</h3>
                    <Button variant="outline" onClick={handleRequestHint}>Nudge / Request Hint</Button>
                  </div>
               )}
            </div>
          )}
        </Card>
      </Main>
    </Container>
  );
}
