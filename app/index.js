import { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SOURATES } from '../data/sourates';
import { useApp } from '../context/AppContext';
import { colors, formatTime } from '../constants/theme';

export default function Accueil() {
  const router = useRouter();
  const { favorites, toggleFavorite, lastPlayed } = useApp();
  const [tab, setTab] = useState('all'); // 'all' | 'fav'
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SOURATES.filter((s) => {
      if (tab === 'fav' && !favorites.includes(s.id)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.arabic.includes(q) ||
        String(s.id) === q
      );
    });
  }, [tab, query, favorites]);

  const last = lastPlayed ? SOURATES[lastPlayed.surah - 1] : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {last && (
        <Pressable
          style={styles.resume}
          onPress={() => router.push(`/sourate/${last.id}`)}
        >
          <Ionicons name="play-circle" size={36} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.resumeLabel}>Reprendre l'écoute</Text>
            <Text style={styles.resumeTitle}>
              {last.id}. {last.name} — {formatTime(lastPlayed.position)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      )}

      <TextInput
        style={styles.search}
        placeholder="Rechercher une sourate (nom ou numéro)"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.tabs}>
        {[
          ['all', 'Toutes'],
          ['fav', `Favoris (${favorites.length})`],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tab === 'fav' ? 'Aucun favori pour le moment.' : 'Aucun résultat.'}
          </Text>
        }
        renderItem={({ item }) => {
          const isFav = favorites.includes(item.id);
          return (
            <Pressable
              style={styles.row}
              onPress={() => router.push(`/sourate/${item.id}`)}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.id}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.verses} versets</Text>
              </View>
              <Text style={styles.arabic}>{item.arabic}</Text>
              <Pressable hitSlop={12} onPress={() => toggleFavorite(item.id)}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFav ? colors.heart : colors.muted}
                />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  resumeLabel: { color: colors.muted, fontSize: 12 },
  resumeTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 2 },
  search: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  tabs: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: '600' },
  tabTextActive: { color: '#06231A' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardAlt,
    gap: 12,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.text, fontWeight: '600' },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  arabic: { color: colors.text, fontSize: 22 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
});
