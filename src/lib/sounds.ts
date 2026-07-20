// A simple utility for synthetic game sounds using the Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function playClickSound() {
  playTone(600, "sine", 0.1);
}

export function playTurnSound() {
  playTone(800, "triangle", 0.15, 0.15);
}

export function playWinSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  // Play a quick arpeggio
  setTimeout(() => playTone(440, "sine", 0.3, 0.2), 0);
  setTimeout(() => playTone(554, "sine", 0.3, 0.2), 150);
  setTimeout(() => playTone(659, "sine", 0.5, 0.2), 300);
  setTimeout(() => playTone(880, "sine", 0.8, 0.2), 450);
}

export function playHintSound() {
  playTone(900, "square", 0.1, 0.05);
  setTimeout(() => playTone(1200, "square", 0.2, 0.05), 100);
}

export function playEndSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  setTimeout(() => playTone(300, "sawtooth", 0.3, 0.2), 0);
  setTimeout(() => playTone(250, "sawtooth", 0.5, 0.2), 200);
}
