let context, timer, enabled = true;
const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23, 246.94, 293.66, 392, 293.66, 261.63, 329.63, 392, 329.63];
let step = 0;
export function unlockMusic() {
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    context.resume().catch(() => {});
  } catch { /* Audio is optional when the browser does not support it. */ }
}
export function startMusic() {
  if (!enabled || timer || !context) return;
  const play = () => {
    if (context.state !== 'running') return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = notes[step++ % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.7);
  };
  play();
  timer = setInterval(play, 750);
}
export function stopMusic() { clearInterval(timer); timer = null; }
export function toggleMusic() {
  enabled = !enabled;
  if (enabled) { unlockMusic(); startMusic(); } else stopMusic();
  return enabled;
}
export function musicEnabled() { return enabled; }
