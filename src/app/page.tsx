"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { styled, globalStyles, keyframes } from "@/stitches.config";
import { playClickSound } from "@/lib/sounds";
import { useLanguage } from "@/contexts/LanguageContext";

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
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
  '@media (max-width: 768px)': { fontSize: '$4' },
});

const Main = styled('main', {
  flex: 1, marginTop: '80px', padding: '$6', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: '$6', width: '100%',
});

const Card = styled('div', {
  backgroundColor: 'rgba(19, 19, 19, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRadius: '$4', padding: '$6', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '$4',
  boxShadow: '$glowCyanInset'
});

const LabelCaps = styled('label', {
  fontFamily: '$space', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '$primaryContainer', marginBottom: '$2', display: 'block'
});

const SecondaryInput = styled('input', {
  width: '100%', backgroundColor: 'rgba(14,14,14,0.4)', border: '1px solid var(--outlineVariant)', borderBottom: '2px solid rgba(0, 240, 255, 0.5)',
  fontFamily: '$mono', fontSize: '24px', textAlign: 'center', color: '#fff', padding: '$3', outline: 'none', fontWeight: 700,
  transition: 'all 0.3s', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)', borderRadius: '$1',
  '&::placeholder': { color: '$surfaceContainerHighest', fontWeight: 400, textShadow: 'none' },
  '&:focus': { borderColor: '$primaryContainer' },
  '&:disabled': { opacity: 0.5 }
});

const ActionBtn = styled('button', {
  width: '100%', backgroundColor: 'rgba(0, 240, 255, 0.2)', border: '1px solid $primaryContainer',
  color: '$primaryContainer', borderRadius: '$1', padding: '$4', fontFamily: '$space', fontSize: '14px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase',
  letterSpacing: '0.15em', transition: 'all 0.3s', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 0 15px rgba(0,240,255,0.4)', fontWeight: 'bold',
  '&:hover': { backgroundColor: 'rgba(0, 240, 255, 0.3)', boxShadow: '0 0 25px rgba(0,240,255,0.6)' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

const ModalOverlay = styled('div', {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '$4',
});

const ModalContent = styled('div', {
  backgroundColor: 'rgba(19, 19, 19, 0.9)', padding: '$6', borderRadius: '$4',
  border: '1px solid $primaryContainer', maxWidth: '600px', width: '100%',
  boxShadow: '$glowCyan', display: 'flex', flexDirection: 'column', gap: '$4'
});

const ModalTitle = styled('h3', {
  fontFamily: '$space', fontSize: '$5', color: '$primaryContainer', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '12px'
});

const ModalText = styled('div', {
  fontFamily: '$mono', fontSize: '14px', lineHeight: 1.6, color: '$onSurface', opacity: 0.9,
  '& ul': { paddingLeft: '$4', marginTop: '$2', listStyleType: 'square' },
  '& li': { marginBottom: '$2' },
  '& strong': { color: '$tertiaryContainer' }
});

export default function Home() {
  globalStyles();
  const [secret, setSecret] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("10");
  const [showWelcome, setShowWelcome] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  const closeWelcome = () => {
    playClickSound();
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
      body: JSON.stringify({ secret, playerName, maxAttempts })
    });
    const data = await response.json();
    
    if (data.gameId) {
      router.push(`/game/${data.gameId}?host=true`);
    } else {
      alert("Failed to create game.");
    }
  };

  return (
    <Root>
      <Header style={{ position: 'fixed', top: 0 }}>
        <Title>{t('siteTitle')}</Title>
      </Header>

      <Main>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '$2' }}>
            <Title css={{ fontSize: '$5', filter: 'none' }}>{t('hostGameTitle')}</Title>
          </div>

          <div>
            <LabelCaps>{t('yourName')}</LabelCaps>
            <SecondaryInput
              placeholder="e.g. Alice"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              css={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <LabelCaps>{t('maxAttempts')}</LabelCaps>
            <SecondaryInput
              placeholder="10"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              css={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <LabelCaps>{t('yourSecretNumber')}</LabelCaps>
            <SecondaryInput
              placeholder="0-100"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={secret}
              onChange={(e) => setSecret(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          
          <ActionBtn onClick={handleStartGame} disabled={!secret || !playerName || !maxAttempts} css={{ marginTop: '$4' }}>
            <span className="material-symbols-outlined">terminal</span> {t('startGameBtn')}
          </ActionBtn>
        </Card>
      </Main>

      {showWelcome && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>info</span>
              {t('welcomeTitle')}
            </ModalTitle>
            <ModalText>
              <p><strong>{t('rulesTitle')}</strong></p>
              <ul>
                <li>{t('rule1')}</li>
                <li>{t('rule2')}</li>
                <li>{t('rule3')}</li>
                <li>{t('rule4')}</li>
              </ul>
            </ModalText>
            <ActionBtn onClick={closeWelcome} css={{ marginTop: '$2' }}>{t('welcomeBtn')}</ActionBtn>
          </ModalContent>
        </ModalOverlay>
      )}
    </Root>
  );
}
