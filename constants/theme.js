export const colors = {
  bg: '#0F1B17',
  card: '#17282A',
  cardAlt: '#1E3436',
  primary: '#2FB67C',
  text: '#F2F5F3',
  muted: '#8FA79F',
  heart: '#F0556E',
};

export function formatTime(sec) {
  if (!sec || sec < 0 || !isFinite(sec)) return '0:00';
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}
