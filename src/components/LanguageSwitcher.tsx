"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { styled } from "@/stitches.config";
import { playClickSound } from "@/lib/sounds";
import { useEffect, useState } from "react";

const SwitcherWrapper = styled('div', {
  position: 'fixed',
  top: '50%',
  right: '0',
  transform: 'translateY(-50%)',
  zIndex: 9999,
  backgroundColor: 'rgba(19, 19, 19, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRight: 'none',
  borderTopLeftRadius: '8px',
  borderBottomLeftRadius: '8px',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.5)',
});

const SwitcherBtn = styled('button', {
  background: 'transparent',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRadius: '$1',
  padding: '6px 12px',
  color: '$primaryContainer',
  fontFamily: '$space',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  '&:hover': {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
  }
});

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    playClickSound();
    toggleLanguage();
  };

  if (!mounted) return (
    <SwitcherWrapper style={{ opacity: 0 }}>
      <SwitcherBtn>EN</SwitcherBtn>
    </SwitcherWrapper>
  );

  return (
    <SwitcherWrapper>
      <SwitcherBtn onClick={handleToggle} title="Switch Language">
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>language</span>
        {language === 'en' ? 'EN' : 'BN'}
      </SwitcherBtn>
    </SwitcherWrapper>
  );
}
