"use client";
import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { styled, globalStyles } from "@/stitches.config";

const Container = styled('div', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',
  backgroundColor: '$background',
});

const Card = styled('div', {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '$3',
  padding: '$5',
  width: '100%',
  maxWidth: '600px',
  boxShadow: '$base',
  textAlign: 'center',
});

const Title = styled('h1', {
  fontSize: '$6',
  marginBottom: '$2',
  background: 'linear-gradient(to right, $primary, #93c5fd)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const Subtitle = styled('p', {
  color: '$foreground',
  opacity: 0.8,
  fontSize: '$3',
  marginBottom: '$5',
});

const ResultBanner = styled('div', {
  padding: '$4',
  borderRadius: '$2',
  marginBottom: '$5',
  fontWeight: 'bold',
  fontSize: '$5',
  variants: {
    status: {
      win: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '$success', border: '1px solid $success' },
      lose: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '$error', border: '1px solid $error' },
      draw: { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '$foreground', border: '1px solid $border' },
    }
  }
});

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$4',
  marginBottom: '$5',
  textAlign: 'left',
});

const StatBox = styled('div', {
  backgroundColor: '$backgroundSubtle',
  padding: '$3',
  borderRadius: '$2',
  border: '1px solid $border',
});

const StatLabel = styled('div', {
  fontSize: '$1',
  color: '$foreground',
  opacity: 0.6,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '$1',
});

const StatValue = styled('div', {
  fontSize: '$4',
  fontWeight: 'bold',
  color: '$foreground',
});

const Button = styled('button', {
  backgroundColor: '$primary',
  color: '#fff',
  padding: '$3 $5',
  borderRadius: '$2',
  fontSize: '$3',
  fontWeight: 'bold',
  width: '100%',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '$primaryHover',
    transform: 'translateY(-2px)',
    boxShadow: '$glow',
  }
});

export default function ReportPage({ params }: { params: Promise<{ gameId: string }> }) {
  globalStyles();
  const { gameId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  
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
          setError("Game not found.");
        } else {
          setGameData(data);
        }
      } catch (err) {
        setError("Error fetching game data.");
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gameId]);

  if (loading) return <Container><Title css={{fontSize: '$4'}}>Loading Report...</Title></Container>;
  if (error || !gameData) return <Container><Title css={{color: '$error', fontSize: '$4'}}>{error}</Title></Container>;

  const status = gameData.game_status;
  let bannerStatus: "win" | "lose" | "draw" = "draw";
  let bannerText = "Game Ended";

  if (status === 'draw') {
    bannerText = "It's a Draw! Max attempts reached.";
  } else if (status === 'ended_manually') {
    bannerText = "Game Ended Manually.";
  } else if (status === 'player_1_won') {
    bannerStatus = isHost ? "win" : "lose";
    bannerText = isHost ? "Congratulations, You Won!" : "Player 1 Won!";
  } else if (status === 'player_2_won') {
    bannerStatus = !isHost ? "win" : "lose";
    bannerText = !isHost ? "Congratulations, You Won!" : "Player 2 Won!";
  }

  return (
    <Container>
      <Card>
        <Title>Game Report</Title>
        <Subtitle>Detailed breakdown of your match.</Subtitle>
        
        <ResultBanner status={bannerStatus}>
          {bannerText}
        </ResultBanner>

        <StatsGrid>
          <StatBox>
            <StatLabel>Player 1 Secret</StatLabel>
            <StatValue>{gameData.secret_number || "N/A"}</StatValue>
          </StatBox>
          <StatBox>
            <StatLabel>Player 2 Secret</StatLabel>
            <StatValue>{gameData.player_2_secret_number || "N/A"}</StatValue>
          </StatBox>
          <StatBox css={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <StatLabel>Total Turns Played</StatLabel>
            <StatValue>{gameData.total_attempts} / 10</StatValue>
          </StatBox>
        </StatsGrid>

        <Button onClick={() => router.push('/')}>
          Play Again
        </Button>
      </Card>
    </Container>
  );
}
