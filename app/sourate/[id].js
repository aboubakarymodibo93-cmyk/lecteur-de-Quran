import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { SOURATES } from '../../data/sourates';
import { AUDIO } from '../../data/audio';
import { useApp } from '../../context/AppContext';
import { colors, formatTime } from '../../constants/theme';

export default function Sourate() {
  const { id } = useLocalSearchParams();
  const n = Number(id);
  const router = useRouter();
  const sourate = SOURATES[n - 1];
  const { ready, favorites, toggleFavorite, lastPlayed, savePosition } = useApp();

  const source = AUDIO[n] ?? null; // null si le fichier n'est pas dans assets/audio
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  const isFav = favorites.includes(n);
  const resumed = useRef(false);
  const posRef = useRef(0);
  posRef.current = status.currentTime;

  // Nouvelle sourate => on autorise une nouvelle reprise de position
  useEffect(() => {
    resumed.current = false;
  }, [n]);

  // 1) Reprendre là où on s'était arrêté, puis lancer la lecture automatiquement
  //    (une seule fois par sourate ouverte)
  useEffect(() => {
    if (!ready || !status.isLoaded || resumed.current) return;
    // Petit délai : évite de lancer play() sur un lecteur qui est aussitôt
    // remplacé ou libéré (rechargement, mode strict en développement).
    const t = setTimeout(() => {
      resumed.current = true;
      if (lastPlayed && lastPlayed.surah === n && lastPlayed.position > 1) {
        player.seekTo(lastPlayed.position);
      }
      player.play();
    }, 200);
    return () => clearTimeout(t);
  }, [ready, status.isLoaded, n]);

  // 2) Sauvegarder la position toutes les 5 s pendant la lecture
  useEffect(() => {
    if (!status.playing) return;
    const t = setInterval(() => savePosition(n, posRef.current), 5000);
    return () => clearInterval(t);
  }, [status.playing, n]);

  // 3) Sauvegarder à la mise en pause
  const wasPlaying = useRef(false);
  useEffect(() => {
    if (wasPlaying.current && !status.playing && posRef.current > 1) {
      savePosition(n, posRef.current);
    }
    wasPlaying.current = status.playing;
  }, [status.playing]);

  // 4) Sauvegarder en quittant l'écran
  useEffect(() => {
    return () => {
      if (posRef.current > 1) savePosition(n, posRef.current);
    };
  }, [n]);

  // 5) Sourate terminée => on remet la position à zéro
  useEffect(() => {
    if (status.didJustFinish) savePosition(n, 0);
  }, [status.didJustFinish]);

  if (!sourate) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missing}>Sourate introuvable.</Text>
      </SafeAreaView>
    );
  }

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // Si la sourate est terminée, on repart du début
    if (status.duration > 0 && status.currentTime >= status.duration - 0.5) {
      player.seekTo(0);
    }
    player.play();
  };

  const skip = (delta) => {
    const target = Math.max(0, Math.min(status.duration || 0, status.currentTime + delta));
    player.seekTo(target);
  };

  const go = (target) => {
    if (target >= 1 && target <= 114) router.replace(`/sourate/${target}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: sourate.name }} />

      <View style={styles.top}>
        <Text style={styles.number}>Sourate {sourate.id}</Text>
        <Text style={styles.arabic}>{sourate.arabic}</Text>
        <Text style={styles.name}>{sourate.name}</Text>
        <Text style={styles.sub}>{sourate.verses} versets</Text>

        <Pressable hitSlop={12} onPress={() => toggleFavorite(n)} style={styles.favBtn}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={30}
            color={isFav ? colors.heart : colors.muted}
          />
          <Text style={styles.favText}>
            {isFav ? 'Dans mes favoris' : 'Ajouter aux favoris'}
          </Text>
        </Pressable>
      </View>

      {!source ? (
        <Text style={styles.missing}>
          Fichier audio absent : ajoute {String(n).padStart(3, '0')}.mp3 dans
          assets/audio puis lance « node scripts/genAudio.js ».
        </Text>
      ) : (
        <View style={styles.player}>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.times}>
            <Text style={styles.time}>{formatTime(status.currentTime)}</Text>
            <Text style={styles.time}>{formatTime(status.duration)}</Text>
          </View>

          <View style={styles.controls}>
            <Pressable onPress={() => go(n - 1)} hitSlop={10}>
              <Ionicons name="play-skip-back" size={28} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => skip(-15)} hitSlop={10}>
              <Ionicons name="play-back" size={30} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={togglePlay}
              disabled={!status.isLoaded}
              style={[styles.playBtn, !status.isLoaded && { opacity: 0.5 }]}
            >
              <Ionicons
                name={status.playing ? 'pause' : 'play'}
                size={36}
                color="#06231A"
              />
            </Pressable>
            <Pressable onPress={() => skip(15)} hitSlop={10}>
              <Ionicons name="play-forward" size={30} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => go(n + 1)} hitSlop={10}>
              <Ionicons name="play-skip-forward" size={28} color={colors.text} />
            </Pressable>
          </View>
          <Text style={styles.hint}>Boutons ◀◀ / ▶▶ : −15 s / +15 s</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'space-between' },
  top: { alignItems: 'center', marginTop: 24 },
  number: { color: colors.muted, fontSize: 14 },
  arabic: { color: colors.text, fontSize: 54, marginTop: 12 },
  name: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 8 },
  sub: { color: colors.muted, marginTop: 4 },
  favBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
  favText: { color: colors.muted },
  player: { marginBottom: 24 },
  barBg: { height: 6, borderRadius: 3, backgroundColor: colors.cardAlt, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.primary },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  time: { color: colors.muted, fontSize: 12 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 16 },
  missing: { color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
});
