"use client";
import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { styled, globalStyles, keyframes } from "@/stitches.config";

const float = keyframes({
  '0%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
  '100%': { transform: 'translateY(0px)' },
});

const Root = styled('div', {
  minHeight: '100vh', display: 'flex', flexDirection: 'column',
  backgroundColor: '$background', color: '$onSurface',
});

const Header = styled('header', {
  backgroundColor: 'rgba(19, 19, 19, 0.9)', backdropFilter: 'blur(30px)',
  borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
  boxShadow: '$glass', display: 'flex', justifyContent: 'center', alignItems: 'center',
  width: '100%', padding: '$4 $6', position: 'fixed', top: 0, zIndex: 50,
});

const Title = styled('h1', {
  fontFamily: '$space', fontSize: '$6', fontWeight: 700,
  background: 'linear-gradient(to right, $primaryContainer, #fff, $primaryContainer)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.6))', margin: 0,
});

const Main = styled('main', {
  flex: 1, marginTop: '80px', padding: '$6', display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: '$6', maxWidth: '800px', marginX: 'auto', width: '100%',
});

const Card = styled('div', {
  backgroundColor: 'rgba(19, 19, 19, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRadius: '$4', padding: '$6', width: '100%', display: 'flex', flexDirection: 'column', gap: '$6',
  boxShadow: '$glowCyanInset', position: 'relative'
});

const ResultBanner = styled('div', {
  padding: '$6', borderRadius: '$2', fontWeight: 700, fontSize: '$5',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '$4',
  animation: `${float} 3s ease-in-out infinite`, textTransform: 'uppercase',
  letterSpacing: '0.1em', fontFamily: '$space',
  '@media (max-width: 768px)': { fontSize: '$4', flexDirection: 'column', textAlign: 'center', padding: '$4' },
  variants: {
    status: {
      win: { 
        backgroundColor: 'rgba(0, 250, 100, 0.1)', color: '$tertiaryContainer', border: '1px solid $tertiaryContainer', boxShadow: '$glowGreen'
      },
      lose: { 
        backgroundColor: 'rgba(254, 0, 254, 0.1)', color: '$secondaryContainer', border: '1px solid $secondaryContainer', boxShadow: '$glowMagenta'
      },
      draw: { 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '$onSurface', border: '1px solid $outlineVariant' 
      },
    }
  }
});

const StatsGrid = styled('div', {
  display: 'grid', gridTemplateColumns: '1fr', gap: '$4', width: '100%',
  '@media (min-width: 768px)': { gridTemplateColumns: '1fr 1fr' }
});

const StatBox = styled('div', {
  backgroundColor: 'rgba(53, 53, 52, 0.3)', padding: '$4', borderRadius: '$2', border: '1px solid rgba(59, 73, 75, 0.5)',
  display: 'flex', flexDirection: 'column', gap: '8px'
});

const StatLabel = styled('div', {
  fontSize: '12px', color: '$primaryContainer', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: '$space',
  display: 'flex', alignItems: 'center', gap: '8px',
});

const StatValue = styled('div', {
  fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: '$mono', textShadow: '0 0 10px rgba(0,240,255,0.4)',
});

const ActionBtn = styled('button', {
  width: '100%', backgroundColor: 'rgba(0, 240, 255, 0.2)', border: '1px solid $primaryContainer',
  color: '$primaryContainer', borderRadius: '$1', padding: '$4', fontFamily: '$space', fontSize: '14px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase',
  letterSpacing: '0.15em', transition: 'all 0.3s', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 0 15px rgba(0,240,255,0.4)', fontWeight: 'bold',
  '&:hover': { backgroundColor: 'rgba(0, 240, 255, 0.3)', boxShadow: '0 0 25px rgba(0,240,255,0.6)' },
});

export default function ReportPage({ params }: { params: Promise<{ gameId: string }> }) {
  globalStyles();
  const { gameId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gameData, setGameData] = useState<any>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();
          
        if (fetchError || !data) {
          setError(t('gameNotFound'));
        } else {
          setGameData(data);
        }
      } catch (err) {
        setError(t('errorFetching'));
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gameId]);

  if (loading) return <Root><Main css={{justifyContent: 'center'}}><Title css={{fontSize: '$4'}}>{t('loadingReport')}</Title></Main></Root>;
  if (error || !gameData) return <Root><Main css={{justifyContent: 'center'}}><Title css={{color: '$error', fontSize: '$4'}}>{error}</Title></Main></Root>;

  const p1Name = gameData.player_1_name || "Player 1";
  const p2Name = gameData.player_2_name || "Player 2";
  const maxAttempts = gameData.max_attempts || 10;
  
  let timeStr = "--:--";
  if (gameData.started_at && gameData.ended_at) {
    const start = new Date(gameData.started_at).getTime();
    const end = new Date(gameData.ended_at).getTime();
    const diff = Math.max(0, Math.floor((end - start) / 1000));
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    timeStr = `${m}:${s}`;
  }

  const status = gameData.game_status;
  let bannerStatus: "win" | "lose" | "draw" = "draw";
  let bannerText = "";
  let bannerIcon = "verified_user";

  if (status === 'draw') {
    bannerText = t('drawMsg');
    bannerIcon = "balance";
  } else if (status === 'ended_manually') {
    bannerText = t('gameEndedManually');
    bannerIcon = "cancel";
  } else if (status === 'player_1_won') {
    bannerStatus = isHost ? "win" : "lose";
    bannerText = isHost ? t('youWon') : t('playerWon', { Name: p1Name });
    bannerIcon = isHost ? "emoji_events" : "skull";
  } else if (status === 'player_2_won') {
    bannerStatus = !isHost ? "win" : "lose";
    bannerText = !isHost ? t('youWon') : t('playerWon', { Name: p2Name });
    bannerIcon = !isHost ? "emoji_events" : "skull";
  }

  return (
    <Root>
      <Header>
        <Title>{t('matchReport')}</Title>
      </Header>
      <Main>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--fonts-mono)', color: 'var(--onSurfaceVariant)', fontSize: '14px', letterSpacing: '0.2em' }}>SYS.LOG_ID // {gameId}</div>
          </div>
          
          <ResultBanner status={bannerStatus}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>{bannerIcon}</span>
            <span>{bannerText}</span>
          </ResultBanner>

          <StatsGrid>
            <StatBox>
              <StatLabel><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock</span> {t('playerSecret', { Name: p1Name })}</StatLabel>
              <StatValue>{gameData.secret_number || "N/A"}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock</span> {t('playerSecret', { Name: p2Name })}</StatLabel>
              <StatValue>{gameData.player_2_secret_number || "N/A"}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>autorenew</span> {t('totalTurns')}</StatLabel>
              <StatValue>{gameData.total_attempts} <span style={{fontSize: '14px', color: 'var(--onSurfaceVariant)'}}>/ {maxAttempts}</span></StatValue>
            </StatBox>
            <StatBox>
              <StatLabel><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span> {t('totalTime')}</StatLabel>
              <StatValue>{timeStr}</StatValue>
            </StatBox>
          </StatsGrid>

          <ActionBtn onClick={() => router.push('/')} css={{ marginTop: '$4' }}>
            <span className="material-symbols-outlined">rocket_launch</span> {t('playAgain')} 🚀
          </ActionBtn>
        </Card>
      </Main>
    </Root>
  );
}
