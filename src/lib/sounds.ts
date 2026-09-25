let audioContext: AudioContext | null = null;
let soundsEnabled = true;

function getAudioContext(): AudioContext | null {
  if (!soundsEnabled) return null;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

export function playClickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.04);
}

export function playCartSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // First tone — lower
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(600, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.07);

  gain1.gain.setValueAtTime(0.12, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.1);

  // Second tone — higher ascending ping
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(900, ctx.currentTime + 0.06);
  osc2.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.15);

  gain2.gain.setValueAtTime(0.001, ctx.currentTime);
  gain2.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.07);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(ctx.currentTime + 0.06);
  osc2.stop(ctx.currentTime + 0.15);
}

export function playBuySound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Whoosh — noise-like sweep using rapid frequency modulation
  const whoosh = ctx.createOscillator();
  const whooshGain = ctx.createGain();

  whoosh.type = "sawtooth";
  whoosh.frequency.setValueAtTime(200, ctx.currentTime);
  whoosh.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.12);

  whooshGain.gain.setValueAtTime(0.06, ctx.currentTime);
  whooshGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  whoosh.connect(whooshGain);
  whooshGain.connect(ctx.destination);

  whoosh.start(ctx.currentTime);
  whoosh.stop(ctx.currentTime + 0.12);

  // Ding — bright ping
  const ding = ctx.createOscillator();
  const dingGain = ctx.createGain();

  ding.type = "sine";
  ding.frequency.setValueAtTime(1500, ctx.currentTime + 0.1);
  ding.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);

  dingGain.gain.setValueAtTime(0.001, ctx.currentTime);
  dingGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.11);
  dingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  ding.connect(dingGain);
  dingGain.connect(ctx.destination);

  ding.start(ctx.currentTime + 0.1);
  ding.stop(ctx.currentTime + 0.2);
}

export function playNavSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.03);
}

export function setSoundsEnabled(enabled: boolean): void {
  soundsEnabled = enabled;

  if (!enabled && audioContext) {
    audioContext.suspend();
  } else if (enabled && audioContext) {
    audioContext.resume();
  }
}