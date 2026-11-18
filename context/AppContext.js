import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = 'favorites';   // [1, 36, 67]
const LAST_KEY = 'lastPlayed'; // { surah: 36, position: 142.5 }

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [ready, setReady] = useState(false);

  // Chargement initial depuis le stockage local
  useEffect(() => {
    (async () => {
      try {
        const [f, l] = await Promise.all([
          AsyncStorage.getItem(FAV_KEY),
          AsyncStorage.getItem(LAST_KEY),
        ]);
        if (f) setFavorites(JSON.parse(f));
        if (l) setLastPlayed(JSON.parse(l));
      } catch (e) {
        console.warn('Lecture du stockage impossible', e);
      }
      setReady(true);
    })();
  }, []);

  const toggleFavorite = useCallback((n) => {
    setFavorites((prev) => {
      const next = prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n];
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const savePosition = useCallback((surah, position) => {
    const value = { surah, position };
    setLastPlayed(value);
    AsyncStorage.setItem(LAST_KEY, JSON.stringify(value)).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ ready, favorites, lastPlayed, toggleFavorite, savePosition }),
    [ready, favorites, lastPlayed, toggleFavorite, savePosition]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}
