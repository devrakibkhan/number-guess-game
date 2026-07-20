"use client";
import { useState, useEffect, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { playClickSound, playTurnSound, playWinSound, playEndSound, playHintSound, playNudgeSound } from "@/lib/sounds";
import { styled, globalStyles, keyframes } from "@/stitches.config";
import { useLanguage } from "@/contexts/LanguageContext";

// --- KEYFRAMES ---
const slideIn = keyframes({
  '0%': { transform: 'translateY(-100%)', opacity: 0 },
  '100%': { transform: 'translateY(0)', opacity: 1 },
});

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

// --- STYLED COMPONENTS ---
const ToastContainer = styled('div', {
  position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
  zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none',
});
const ToastMessage = styled('div', {
  padding: '12px 24px', borderRadius: '$2', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  animation: `${slideIn} 0.3s ease-out forwards`,
  variants: {
    type: {
      success: { backgroundColor: '$tertiaryContainer', color: '#131313' },
      info: { backgroundColor: '$primaryContainer', color: '#131313' },
      error: { backgroundColor: '$error', color: '$onError' },
    }
  }
});

const Root = styled('div', {
  minHeight: '100vh', display: 'flex', flexDirection: 'column',
  backgroundColor: '$background', color: '$onSurface',
});

const Header = styled('header', {
  backgroundColor: 'rgba(19, 19, 19, 0.9)', backdropFilter: 'blur(30px)',
  borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
  boxShadow: '$glass', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  width: '100%', padding: '$4 $6', position: 'fixed', top: 0, zIndex: 50,
  '@media (max-width: 768px)': { padding: '$3 $4', position: 'relative' }
});

// SysBadge removed

const Title = styled('h1', {
  fontFamily: '$space', fontSize: '$5', fontWeight: 700,
  background: 'linear-gradient(to right, $primaryContainer, #fff, $primaryContainer)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.6))', margin: 0,
  '@media (max-width: 768px)': { fontSize: '$4' }
});

const AbortBtn = styled('button', {
  fontFamily: '$space', fontSize: '12px', color: '$error', border: '1px solid rgba(255,180,171,0.3)',
  backgroundColor: 'transparent', padding: '8px 16px', borderRadius: '$1', textTransform: 'uppercase',
  letterSpacing: '0.15em', transition: 'all 0.3s',
  '&:hover': { borderColor: '$error', backgroundColor: 'rgba(255, 180, 171, 0.1)', boxShadow: '0 0 15px rgba(255, 180, 171, 0.3)' }
});

const Main = styled('main', {
  flex: 1, marginTop: '100px', padding: '$6', display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: '$6', maxWidth: '1200px', marginX: 'auto', width: '100%',
  position: 'relative', zIndex: 10,
  '@media (max-width: 768px)': { marginTop: '20px', padding: '$4', gap: '$4' }
});

const StatsBar = styled('div', {
  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  backgroundColor: 'rgba(19, 19, 19, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '$4',
  padding: '$5 $6', boxShadow: '$base', position: 'relative',
  borderTop: '1px solid rgba(185, 202, 203, 0.3)',
  '@media (max-width: 768px)': { flexDirection: 'column', gap: '$4', alignItems: 'flex-start' }
});

const CornerAccent = styled('div', {
  position: 'absolute', width: '16px', height: '16px',
  variants: {
    pos: {
      tl: { top: -1, left: -1, borderTop: '2px solid', borderLeft: '2px solid' },
      tr: { top: -1, right: -1, borderTop: '2px solid', borderRight: '2px solid' },
      bl: { bottom: -1, left: -1, borderBottom: '2px solid', borderLeft: '2px solid' },
      br: { bottom: -1, right: -1, borderBottom: '2px solid', borderRight: '2px solid' },
    },
    color: {
      primary: { borderColor: 'rgba(0, 240, 255, 0.5)' },
      secondary: { borderColor: 'rgba(254, 0, 254, 0.5)' },
      tertiary: { borderColor: 'rgba(0, 250, 100, 0.5)' },
    }
  }
});

const GridPanel = styled('div', {
  display: 'grid', gridTemplateColumns: '1fr', gap: '$6', width: '100%', marginTop: '16px',
  '@media (min-width: 768px)': { gridTemplateColumns: '1fr 1fr' }
});

const Panel = styled('div', {
  backgroundColor: 'rgba(19, 19, 19, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '$4',
  padding: '$6', display: 'flex', flexDirection: 'column', gap: '$6', position: 'relative',
  transition: 'border-color 0.5s', overflow: 'hidden', className: 'group',
  variants: {
    variant: {
      primary: { border: '1px solid rgba(0, 240, 255, 0.2)', '&:hover': { borderColor: 'rgba(0, 240, 255, 0.5)' } },
      secondary: { border: '1px solid rgba(254, 0, 254, 0.2)', '&:hover': { borderColor: 'rgba(254, 0, 254, 0.5)' } },
    }
  }
});

const PanelGlow = styled('div', {
  position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', transition: 'background-color 0.7s',
  variants: {
    pos: { left: { left: -128, bottom: -128 }, right: { right: -128, top: -128 } },
    color: {
      primary: { backgroundColor: 'rgba(0, 240, 255, 0.05)', '.group:hover &': { backgroundColor: 'rgba(0, 240, 255, 0.1)' } },
      secondary: { backgroundColor: 'rgba(254, 0, 254, 0.05)', '.group:hover &': { backgroundColor: 'rgba(254, 0, 254, 0.1)' } }
    }
  }
});

const LabelCaps = styled('span', {
  fontFamily: '$space', fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
  opacity: 0.8,
  variants: { color: { primary: { color: '$primaryContainer' }, secondary: { color: '$secondaryContainer' } } }
});

const HintBtn = styled('button', {
  borderRadius: '$2', padding: '$4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: '8px', fontFamily: '$space', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
  backgroundColor: 'transparent', transition: 'all 0.3s', border: '1px solid rgba(255,255,255,0.1)', color: '$onSurface',
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  variants: {
    active: {
      cyan: { backgroundColor: 'rgba(0, 240, 255, 0.2)', borderColor: '$primaryContainer', color: '$primaryContainer', boxShadow: '$glowCyan' },
      magenta: { backgroundColor: 'rgba(254, 0, 254, 0.2)', borderColor: '$secondaryContainer', color: '$secondaryContainer', boxShadow: '$glowMagenta' },
      green: { backgroundColor: 'rgba(0, 250, 100, 0.2)', borderColor: '$tertiaryContainer', color: '$tertiaryContainer', boxShadow: '$glowGreen' },
    }
  }
});

const GlowingInputWrapper = styled('div', {
  position: 'relative', backgroundColor: 'rgba(14, 14, 14, 0.4)', borderRadius: '$1', border: '1px solid rgba(59, 73, 75, 0.3)', padding: '8px',
});

const GlowingInput = styled('input', {
  width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid rgba(254, 0, 254, 0.5)',
  fontFamily: '$mono', fontSize: '48px', textAlign: 'center', color: '#fff', padding: '$2', outline: 'none', fontWeight: 700,
  transition: 'all 0.3s', textShadow: '0 0 15px rgba(254, 0, 254, 0.4)',
  '&::placeholder': { color: '$surfaceContainerHighest', fontWeight: 400, textShadow: 'none' },
  '&:focus': { borderColor: '$secondaryContainer' },
  '&:disabled': { opacity: 0.5 },
  '@media (max-width: 768px)': { fontSize: '32px' }
});

const SecondaryInput = styled('input', {
  width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid rgba(0, 240, 255, 0.5)',
  fontFamily: '$mono', fontSize: '24px', textAlign: 'center', color: '#fff', padding: '$2', outline: 'none', fontWeight: 700,
  transition: 'all 0.3s', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
  '&::placeholder': { color: '$surfaceContainerHighest', fontWeight: 400, textShadow: 'none' },
  '&:focus': { borderColor: '$primaryContainer' },
  '&:disabled': { opacity: 0.5 }
});

const ActionBtn = styled('button', {
  width: '100%', backgroundColor: 'rgba(53, 53, 52, 0.3)', border: '1px solid rgba(59, 73, 75, 0.5)',
  color: '$onSurfaceVariant', borderRadius: '$1', padding: '$4', fontFamily: '$space', fontSize: '12px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase',
  letterSpacing: '0.15em', transition: 'all 0.3s', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)', fontWeight: 'bold',
  '&:hover:not(:disabled)': { borderColor: '$primaryContainer', backgroundColor: 'rgba(0, 240, 255, 0.1)', color: '$primaryContainer' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  variants: {
    primary: {
      true: { backgroundColor: 'rgba(0, 240, 255, 0.2)', color: '$primaryContainer', borderColor: '$primaryContainer' }
    }
  }
});

const MessageArea = styled('div', {
  width: '100%', maxWidth: '768px', backgroundColor: 'rgba(19,19,19,0.4)', backdropFilter: 'blur(10px)',
  borderRadius: '$1', padding: '$4', marginTop: '$6', position: 'relative', overflow: 'hidden',
  border: '1px solid rgba(0, 240, 255, 0.3)', borderLeft: '4px solid $primaryContainer',
});

const JoinCard = styled('div', {
  backgroundColor: 'rgba(19, 19, 19, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRadius: '$4', padding: '$6', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '$4',
  boxShadow: '$glowCyanInset'
});

const JoinLabel = styled('label', {
  fontFamily: '$space', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '$primaryContainer', marginBottom: '$2', display: 'block'
});

const GuessHeading = styled('h2', {
  fontFamily: '$space', fontSize: '32px', fontWeight: 'bold', textTransform: 'uppercase', margin: '8px 0 0 0',
  '@media (max-width: 768px)': { fontSize: '20px' }
});

const GuessValue = styled('span', {
  fontFamily: '$mono', fontSize: '48px', color: '$primaryContainer', textShadow: '0 0 20px rgba(0,240,255,0.6)', marginLeft: '12px', verticalAlign: 'middle',
  '@media (max-width: 768px)': { fontSize: '32px', display: 'block', marginLeft: 0, marginTop: '8px' }
});

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  globalStyles();
  const { t } = useLanguage();
  const { gameId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  
  const [elapsed, setElapsed] = useState("00:00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [secretNumber, setSecretNumber] = useState("");
  const [player2Secret, setPlayer2Secret] = useState("");
  const [gameStatus, setGameStatus] = useState("");
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(10);
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  
  const [currentGuess, setCurrentGuess] = useState("");
  const [player1CurrentGuess, setPlayer1CurrentGuess] = useState("");
  const [hint, setHint] = useState("");
  const [player2Hint, setPlayer2Hint] = useState("");

  const prevStatusRef = useRef(gameStatus);

  const [joinName, setJoinName] = useState("");
  const [joinSecret, setJoinSecret] = useState("");
  const [joinGuess, setJoinGuess] = useState("");
  const [turnGuess, setTurnGuess] = useState("");
  const [turnHint, setTurnHint] = useState<"less" | "more" | "correct" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const [customHintRequested, setCustomHintRequested] = useState(false);
  const [customHintInput, setCustomHintInput] = useState("");
  const [receivedCustomHint, setReceivedCustomHint] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error', id: number} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, 3000);
  };

  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      const start = new Date(startedAt).getTime();
      const end = endedAt ? new Date(endedAt).getTime() : Date.now();
      const diff = Math.floor((end - start) / 1000);
      if (diff < 0) return;
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, endedAt]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error: fetchError } = await supabase.from('games').select('*').eq('id', gameId).single();
        if (fetchError || !data) {
          setError("Game not found or has expired.");
        } else {
          setSecretNumber(data.secret_number || "");
          setPlayer2Secret(data.player_2_secret_number || "");
          setGameStatus(data.game_status || "waiting_player_2");
          setTotalAttempts(data.total_attempts || 0);
          setMaxAttempts(data.max_attempts || 10);
          if (data.player_1_name) setPlayer1Name(data.player_1_name);
          if (data.player_2_name) setPlayer2Name(data.player_2_name);
          if (data.started_at) setStartedAt(data.started_at);
          if (data.ended_at) setEndedAt(data.ended_at);
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

    const channel = supabase.channel(`game-${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
        const newState = payload.new;
        if (newState.secret_number) setSecretNumber(newState.secret_number);
        if (newState.player_2_secret_number) setPlayer2Secret(newState.player_2_secret_number);
        if (newState.total_attempts !== undefined) setTotalAttempts(newState.total_attempts);
        if (newState.current_guess) setCurrentGuess(newState.current_guess);
        if (newState.player_1_current_guess) setPlayer1CurrentGuess(newState.player_1_current_guess);
        if (newState.hint) setHint(newState.hint);
        if (newState.player_2_hint) setPlayer2Hint(newState.player_2_hint);
        if (newState.player_1_name) setPlayer1Name(newState.player_1_name);
        if (newState.player_2_name) setPlayer2Name(newState.player_2_name);
        if (newState.started_at) setStartedAt(newState.started_at);
        if (newState.ended_at) setEndedAt(newState.ended_at);
        if (newState.game_status) {
          const newStatus = newState.game_status;
          setGameStatus(newStatus);
          if (newStatus !== prevStatusRef.current) {
             if (newStatus === 'player_1_won' || newStatus === 'player_2_won') playWinSound();
             else if (newStatus === 'ended_manually' || newStatus === 'draw') playEndSound();
             prevStatusRef.current = newStatus;
          }
        }
        setTurnGuess("");
        setTurnHint("");
      })
      .on('broadcast', { event: 'request_hint' }, (payload) => {
         const sender = payload.payload.sender;
         if (sender !== (isHost ? 'host' : 'player2')) {
           playHintSound();
           setCustomHintRequested(true);
         }
      })
      .on('broadcast', { event: 'send_hint' }, (payload) => {
         const sender = payload.payload.sender;
         if (sender !== (isHost ? 'host' : 'player2')) {
           playHintSound();
           setReceivedCustomHint(payload.payload.message);
         }
      })
      .on('broadcast', { event: 'nudge' }, (payload) => {
         const sender = payload.payload.sender;
         if (sender !== (isHost ? 'host' : 'player2')) {
           playNudgeSound();
           showToast(t('nudge'), "info");
         }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [gameId, isHost]);

  useEffect(() => {
    const isGameOver = gameStatus === 'player_1_won' || gameStatus === 'player_2_won' || gameStatus === 'draw' || gameStatus === 'ended_manually';
    if (isGameOver) router.push(`/report/${gameId}?host=${isHost}`);
  }, [gameStatus, gameId, isHost, router]);

  const handleJoinGame = async () => {
    if (!joinSecret || !joinGuess || !joinName) return;
    playClickSound();
    setSubmitting(true);
    try {
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, player2Secret: joinSecret, currentGuess: joinGuess, player2Name: joinName })
      });
      const data = await response.json();
      if (data.error) showToast(data.error, "error");
      else playTurnSound();
    } catch (err) {
      showToast("Network error joining game", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-evaluate hint
  useEffect(() => {
    const isMyTurn = isHost ? gameStatus === 'player_1_turn' : gameStatus === 'player_2_turn';
    const opponentGuessStr = isHost ? currentGuess : player1CurrentGuess;
    const mySecretStr = isHost ? secretNumber : player2Secret;
    const haveIWon = isHost ? player2Hint === 'correct' : hint === 'correct';

    if (isMyTurn && opponentGuessStr && mySecretStr) {
      const opp = parseInt(opponentGuessStr);
      const sec = parseInt(mySecretStr);
      if (!isNaN(opp) && !isNaN(sec)) {
        if (opp < sec) setTurnHint('more');
        else if (opp > sec) setTurnHint('less');
        else setTurnHint('correct');
      }
    }
  }, [gameStatus, isHost, currentGuess, player1CurrentGuess, secretNumber, player2Secret, player2Hint, hint]);

  const handleTurnSubmit = async () => {
    if (!turnHint) return;
    
    const haveIWon = isHost ? player2Hint === 'correct' : hint === 'correct';
    if (!haveIWon && !turnGuess) return;
    
    playClickSound();
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/games/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId, 
          isHost, 
          hint: turnHint, 
          nextGuess: !haveIWon ? turnGuess : null
        })
      });
      const data = await response.json();
      if (data.error) showToast(data.error, "error");
      else playTurnSound();
    } catch (err) {
      showToast("Network error submitting turn", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndGame = async () => {
    playClickSound();
    if (confirm("Are you sure you want to abort the game?")) {
      await fetch('/api/games/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, reason: 'ended_manually' })
      });
    }
  };

  const handleRequestHint = async () => {
    playClickSound();
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast', event: 'request_hint', payload: { sender: isHost ? 'host' : 'player2' }
      });
      showToast("Hint requested!", "success");
    }
  };

  const handleSendCustomHint = async () => {
    if (!customHintInput) return;
    playClickSound();
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast', event: 'send_hint', payload: { sender: isHost ? 'host' : 'player2', message: customHintInput }
      });
      setCustomHintRequested(false);
      setCustomHintInput("");
    }
  };

  const handleNudge = async () => {
    playClickSound();
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast', event: 'nudge', payload: { sender: isHost ? 'host' : 'player2' }
      });
      showToast("Nudge sent!", "success");
    }
  };

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard.writeText(`${window.location.origin}/game/${gameId}`);
    setCopied(true);
    showToast("Link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHintSelection = (h: "less" | "more" | "correct") => {
    playClickSound();
    setTurnHint(h);
  };

  if (loading) return <Root css={{justifyContent: 'center', alignItems: 'center'}}><Title>Loading...</Title></Root>;
  if (error) return <Root css={{justifyContent: 'center', alignItems: 'center'}}><Title css={{color: '$error'}}>{error}</Title></Root>;

  const isMyTurn = (isHost && gameStatus === 'player_1_turn') || (!isHost && gameStatus === 'player_2_turn');
  const activeOpponentName = isHost ? player2Name : player1Name;
  const opponentHasWon = isHost ? hint === 'correct' : player2Hint === 'correct';

  return (
    <Root>
      {toast && (
        <ToastContainer>
          <ToastMessage type={toast.type} key={toast.id}>
            {toast.message}
          </ToastMessage>
        </ToastContainer>
      )}
      
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: 'var(--onSurfaceVariant)' }}>{isHost ? `${player1Name}` : `${player2Name}`}</div>
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Title css={{ display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>Two-Way Number Guessing</Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primaryContainer)', backgroundColor: 'rgba(0,240,255,0.1)', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(0,240,255,0.3)' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span>
             <span style={{ fontFamily: 'var(--fonts-mono)', fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.1em', textShadow: '0 0 5px rgba(0,240,255,0.8)' }}>
               {elapsed}
             </span>
          </div>
          <AbortBtn onClick={handleEndGame}>End Game</AbortBtn>
        </div>
      </Header>

      <Main>
        {gameStatus === 'waiting_player_2' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {isHost ? (
              <JoinCard>
                <Title css={{ fontSize: '$4', textAlign: 'center', marginBottom: '$4' }}>Waiting for Player 2...</Title>
                <LabelCaps css={{ textAlign: 'center', color: '$onSurfaceVariant' }}>Share this link with Player 2:</LabelCaps>
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', wordBreak: 'break-all', border: '1px solid var(--outlineVariant)', textAlign: 'center' }}>
                  <a href={`${window.location.origin}/game/${gameId}`} style={{ color: 'var(--primaryContainer)', fontFamily: 'var(--fonts-mono)' }}>{`${window.location.origin}/game/${gameId}`}</a>
                </div>
                <ActionBtn primary={true} onClick={handleCopy} css={{ marginTop: '$4' }}>
                   <span className="material-symbols-outlined">content_copy</span>
                   {copied ? 'Link Copied!' : 'Copy Link'}
                </ActionBtn>
              </JoinCard>
            ) : (
              <JoinCard>
                <Title css={{ fontSize: '$4', textAlign: 'center', marginBottom: '$4' }}>Join Game</Title>
                <div>
                  <JoinLabel>Your Name</JoinLabel>
                  <SecondaryInput placeholder="e.g. Neo" value={joinName} onChange={e => setJoinName(e.target.value)} disabled={submitting} css={{ fontSize: '16px', padding: '12px' }} />
                </div>
                <div>
                  <JoinLabel>Your Secret Number</JoinLabel>
                  <SecondaryInput type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0-100" value={joinSecret} onChange={e => setJoinSecret(e.target.value.replace(/\D/g, ''))} disabled={submitting} css={{ fontSize: '24px' }} />
                </div>
                <div>
                  <JoinLabel>First Guess for {player1Name}'s Secret</JoinLabel>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <SecondaryInput type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0-100" value={joinGuess} onChange={e => setJoinGuess(e.target.value.replace(/\D/g, ''))} disabled={submitting} css={{ fontSize: '24px', flex: 1 }} />
                    <ActionBtn onClick={handleRequestHint} css={{ flex: '0 0 auto', width: 'auto' }}>
                       <span className="material-symbols-outlined">lightbulb</span> {t('hint')}
                    </ActionBtn>
                  </div>
                </div>
                {receivedCustomHint && (
                  <MessageArea>
                    <LabelCaps color="primary">Message from {player1Name}</LabelCaps>
                    <div style={{ fontFamily: 'var(--fonts-mono)', fontStyle: 'italic', marginTop: '8px' }}>"{receivedCustomHint}"</div>
                    <button onClick={() => setReceivedCustomHint('')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}>✕</button>
                  </MessageArea>
                )}
                <ActionBtn primary={true} onClick={handleJoinGame} disabled={submitting || !joinSecret || !joinGuess || !joinName} css={{ marginTop: '$4', fontSize: '14px', padding: '$3' }}>
                  {submitting ? 'Connecting...' : 'Join'}
                </ActionBtn>
              </JoinCard>
            )}
          </div>
        )}

        {gameStatus !== 'waiting_player_2' && (
          <>
            <StatsBar>
              <CornerAccent pos="tl" color="tertiary" />
              <CornerAccent pos="bl" color="tertiary" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '8px', backgroundColor: 'rgba(0, 250, 100, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 250, 100, 0.3)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--tertiaryContainer)' }}>vpn_key</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <LabelCaps>{t('secretNumber', { Name: isHost ? player1Name : player2Name })}</LabelCaps>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--fonts-mono)', fontSize: '28px', color: 'var(--tertiaryContainer)', fontWeight: 'bold', textShadow: '0 0 12px rgba(0,250,100,0.6)' }}>
                      {isHost ? secretNumber : player2Secret}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <LabelCaps>Attempts</LabelCaps>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{ width: '100%', minWidth: '256px', height: '8px', backgroundColor: 'var(--surfaceContainerHighest)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--outlineVariant)' }}>
                    <div style={{ height: '100%', width: `${(totalAttempts / maxAttempts) * 100}%`, background: 'linear-gradient(to right, var(--primary), var(--primaryContainer))', boxShadow: '0 0 10px rgba(0,240,255,0.8)' }}></div>
                  </div>
                  <span style={{ fontFamily: 'var(--fonts-mono)', fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 8px rgba(0,240,255,0.5)' }}>
                    <span style={{ color: 'var(--primaryContainer)' }}>{totalAttempts.toString().padStart(2, '0')}</span>
                    <span style={{ color: 'var(--onSurfaceVariant)' }}>/{maxAttempts}</span>
                  </span>
                </div>
              </div>
              <CornerAccent pos="tr" color="primary" />
              <CornerAccent pos="br" color="primary" />
            </StatsBar>

            <GridPanel>
              <Panel variant="primary" className="group">
                <CornerAccent pos="tl" color="primary" />
                <CornerAccent pos="tr" color="primary" />
                <CornerAccent pos="bl" color="primary" />
                <CornerAccent pos="br" color="primary" />
                <PanelGlow pos="right" color="primary" />
                
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primaryContainer)', borderRadius: '50%', boxShadow: '0 0 8px rgba(0,240,255,0.8)', animation: `${pulse} 2s infinite` }}></div>
                    <LabelCaps color="primary">{t('opponentsGuess', { OpponentName: activeOpponentName })}</LabelCaps>
                  </div>
                  <GuessHeading>
                    <GuessValue>
                      {t('guessValue', { Value: (isHost ? currentGuess : player1CurrentGuess) || '--' })}
                    </GuessValue>
                  </GuessHeading>
                </div>

                {isMyTurn ? (
                  opponentHasWon ? (
                    <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', padding: '24px 0', textAlign: 'center', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <LabelCaps color="primary">{activeOpponentName} is 1st! They are just watching now.</LabelCaps>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', minHeight: '120px' }}>
                      <HintBtn active={turnHint === 'less' ? 'magenta' : undefined} style={{ pointerEvents: 'none' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>keyboard_double_arrow_down</span>
                        {t('less')}
                      </HintBtn>
                      <HintBtn active={turnHint === 'more' ? 'cyan' : undefined} style={{ pointerEvents: 'none' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>keyboard_double_arrow_up</span>
                        {t('more')}
                      </HintBtn>
                      <HintBtn active={turnHint === 'correct' ? 'green' : undefined} style={{ pointerEvents: 'none' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>done_all</span>
                        {t('correct')}
                      </HintBtn>
                    </div>
                  )
                ) : (
                  <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', padding: '24px 0', textAlign: 'center', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <LabelCaps color="primary">Waiting for {activeOpponentName}...</LabelCaps>
                  </div>
                )}
              </Panel>

              <Panel variant="secondary" className="group">
                <CornerAccent pos="tl" color="secondary" />
                <CornerAccent pos="tr" color="secondary" />
                <CornerAccent pos="bl" color="secondary" />
                <CornerAccent pos="br" color="secondary" />
                <PanelGlow pos="left" color="secondary" />

                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--secondaryContainer)', borderRadius: '50%', boxShadow: '0 0 8px rgba(254,0,254,0.8)', animation: `${pulse} 2s infinite` }}></div>
                    <LabelCaps color="secondary">YOUR TURN</LabelCaps>
                  </div>
                  <h2 style={{ fontFamily: 'var(--fonts-space)', fontSize: '22px', textTransform: 'uppercase', margin: '8px 0 0 0' }}>
                    {t('yourTurnGuess', { MyName: isHost ? player1Name : player2Name, Value: (isHost ? player1CurrentGuess : currentGuess) || '--' })}
                  </h2>
                </div>

                <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {isMyTurn ? (
                    <>
                      {(isHost ? player2Hint : hint) && (
                        <div style={{ padding: '8px', border: '1px solid var(--outlineVariant)', borderRadius: '4px', textAlign: 'center', color: (isHost ? player2Hint : hint) === 'correct' ? 'var(--tertiaryContainer)' : 'var(--secondaryContainer)' }}>
                          {t('hintReceived', { HINT: t((isHost ? player2Hint : hint) || '') })}
                        </div>
                      )}
                      
                      {(() => {
                        const haveIWon = isHost ? player2Hint === 'correct' : hint === 'correct';
                        return !haveIWon ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {turnHint === 'correct' && (
                              <div style={{ color: 'var(--tertiaryContainer)', textAlign: 'center', fontWeight: 'bold' }}>
                                {activeOpponentName} won! You can still finish your attempts.
                              </div>
                            )}
                            <GlowingInputWrapper>
                              <GlowingInput type="text" inputMode="numeric" pattern="[0-9]*" placeholder="--" value={turnGuess} onChange={e => setTurnGuess(e.target.value.replace(/\D/g, ''))} disabled={submitting} />
                            </GlowingInputWrapper>
                          </div>
                        ) : (
                          <div style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--tertiaryContainer)', color: 'var(--tertiaryContainer)', borderRadius: '4px', textShadow: '0 0 10px rgba(0,250,100,0.5)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '8px' }}>verified</span>
                            <div>You are 1st! Continue playing...</div>
                          </div>
                        );
                      })()}
                      
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <ActionBtn onClick={handleRequestHint}>
                          <span className="material-symbols-outlined">lightbulb</span> {t('requestHint')}
                        </ActionBtn>
                        {(() => {
                          const haveIWon = isHost ? player2Hint === 'correct' : hint === 'correct';
                          return (
                            <ActionBtn primary={true} onClick={handleTurnSubmit} disabled={submitting || !turnHint || (!haveIWon && !turnGuess)}>
                              <span className="material-symbols-outlined">send</span> {submitting ? t('send') : t('send')}
                            </ActionBtn>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      {customHintRequested ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <LabelCaps color="secondary">Hint Requested by {activeOpponentName}</LabelCaps>
                          <SecondaryInput type="text" maxLength={50} placeholder="Type hint here" value={customHintInput} onChange={e => setCustomHintInput(e.target.value)} />
                          <ActionBtn primary={true} onClick={handleSendCustomHint}>Send Hint</ActionBtn>
                        </div>
                      ) : (
                        <ActionBtn onClick={handleNudge}>
                          <span className="material-symbols-outlined">notifications_active</span> {t('nudge')}
                        </ActionBtn>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </GridPanel>
            
            {receivedCustomHint && (
              <MessageArea>
                <button onClick={() => setReceivedCustomHint('')} aria-label="Close Message" style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--onSurfaceVariant)', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 10 }}>
                  <div style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.3)', boxShadow: '0 0 10px rgba(0,240,255,0.2)' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primaryContainer)' }}>chat</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <LabelCaps color="primary">Message from {activeOpponentName}</LabelCaps>
                    <p style={{ fontFamily: 'var(--fonts-mono)', fontSize: '15px', color: '#fff', fontStyle: 'italic', borderLeft: '2px solid rgba(0,240,255,0.5)', paddingLeft: '12px', margin: '4px 0' }}>
                      "{receivedCustomHint}"
                    </p>
                  </div>
                </div>
              </MessageArea>
            )}
          </>
        )}
      </Main>
    </Root>
  );
}
