// Synthesised two-note bell (no asset to ship); no-ops if audio is blocked.
let ctx: AudioContext | undefined;

export function playChime(): void {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [659.25, 987.77].forEach((freq, k) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      const t = now + k * 0.18;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 1.7);
    });
  } catch {
    /* audio unavailable — stay silent */
  }
}
