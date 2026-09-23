// Authentic EVM Beep synthesizer using Web Audio API
export function playEVMBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    // Classic EVM beep frequency ~ 2800 Hz
    osc.frequency.setValueAtTime(2800, ctx.currentTime);

    // Initial sharp attack
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    // Beep sustains for 1.2 seconds, then cuts off cleanly
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.3);
  } catch (e) {
    console.debug('Audio play inhibited or unsupported:', e);
  }
}

// Gentle VVPAT printer mechanical click/feed sound
export function playPrinterSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400 + i * 80, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.09);
    }
  } catch (e) {
    console.debug('Printer audio inhibited:', e);
  }
}
