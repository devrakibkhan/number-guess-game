"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    secretNumber: "{Name}'s Secret Number:",
    opponentsGuess: "{OpponentName}'s Guess",
    guessValue: "{Value}",
    more: "MORE",
    less: "LESS",
    correct: "CORRECT",
    yourTurnGuess: "{MyName}'s Last Guess: {Value}",
    hintReceived: "You need '{HINT}'",
    send: "SEND",
    nudge: "Hurry up, please.",
    requestHint: "Request Hint",
    hint: "Hint",
    siteTitle: "Number Guessing Game",
    hostGameTitle: "Game's Details",
    startGameBtn: "Start Game",
    yourName: "Your Name",
    maxAttempts: "Max Attempts",
    yourSecretNumber: "Your Secret Number",
    welcomeTitle: "Welcome to the Number Guessing Game!",
    rulesTitle: "Game Rules:",
    rule1: "1. Secret Number: Enter your secret number.",
    rule2: "2. Attempts: Enter how many attempts are allowed.",
    rule3: "3. Start Game: Click the start game button.",
    rule4: "4. Link: Share the link with another player. But that link is not for you!",
    welcomeBtn: "Got it, let's play!",
    matchReport: "Match Report",
    loadingReport: "Loading Report...",
    gameNotFound: "Game not found.",
    errorFetching: "Error fetching game data.",
    drawMsg: "It's a Draw! Max attempts reached.",
    gameEndedManually: "Game Ended Manually.",
    youWon: "Congratulations, You Won!",
    playerWon: "{Name} Won!",
    playerSecret: "{Name}'s Secret",
    totalTurns: "Total Turns",
    totalTime: "Total Time",
    playAgain: "Play Again",
  },
  bn: {
    secretNumber: "{Name} এর গোপন নাম্বার:",
    opponentsGuess: "{OpponentName} এর অনুমান",
    guessValue: "{Value}",
    more: "বেশি",
    less: "কম",
    correct: "সঠিক",
    yourTurnGuess: "{MyName} এর সর্বশেষ অনুমান: {Value}",
    hintReceived: "তোমার ‘{HINT}’ দরকার",
    send: "পাঠান",
    nudge: "তাড়াতাড়ি করুন, প্লিজ",
    requestHint: "সাহায্যের অনুরোধ",
    hint: "সাহায্য",
    siteTitle: "Number Guessing Game",
    hostGameTitle: "খেলার বর্ণনা",
    startGameBtn: "খেলা শুরু",
    yourName: "আপনার নাম",
    maxAttempts: "সর্বোচ্চ চেষ্টা",
    yourSecretNumber: "আপনার গোপন নম্বর",
    welcomeTitle: "সংখ্যা অনুমান খেলায় আপনাকে স্বাগতম!",
    rulesTitle: "খেলার নিয়ম:",
    rule1: "১. গোপন সংখ্যা: আপনার গোপন সংখ্যা লিখুন।",
    rule2: "২. চেষ্টা: কতবার চেষ্টা করা যাবে তা লিখুন।",
    rule3: "৩. খেলা শুরু: খেলা শুরু বাটনে ক্লিক করুন।",
    rule4: "৪. লিংক: অন্য খেলোয়ারকে লিংকটি দিন। কিন্তু সেই লিংকটি আপনার জন্য নয়!",
    welcomeBtn: "বুঝেছি, চলো খেলি!",
    matchReport: "ম্যাচ রিপোর্ট",
    loadingReport: "রিপোর্ট লোড হচ্ছে...",
    gameNotFound: "খেলাটি পাওয়া যায়নি।",
    errorFetching: "তথ্য সংগ্রহে ত্রুটি।",
    drawMsg: "খেলা ড্র! সর্বোচ্চ চেষ্টা শেষ।",
    gameEndedManually: "খেলা ম্যানুয়ালি শেষ করা হয়েছে।",
    youWon: "অভিনন্দন, আপনি জিতেছেন!",
    playerWon: "{Name} জিতেছে!",
    playerSecret: "{Name} এর গোপন নাম্বার",
    totalTurns: "মোট রাউন্ড",
    totalTime: "মোট সময়",
    playAgain: "আবার খেলুন",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // On mount, read from localStorage if available
  useEffect(() => {
    const storedLang = localStorage.getItem("app_lang") as Language | null;
    if (storedLang && (storedLang === "en" || storedLang === "bn")) {
      setLanguage(storedLang);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const nextLang = prev === "en" ? "bn" : "en";
      localStorage.setItem("app_lang", nextLang);
      return nextLang;
    });
  };

  const t = (key: string, variables?: Record<string, string>) => {
    let str = translations[language][key] || key;
    if (variables) {
      Object.keys(variables).forEach(vKey => {
        str = str.replace(`{${vKey}}`, variables[vKey]);
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
