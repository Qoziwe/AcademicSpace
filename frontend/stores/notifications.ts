/**
 * Настройки уведомлений (Zustand + AsyncStorage) — экран SETTINGS,
 * группа «Уведомления». Чисто клиентский UI-стейт (`CLAUDE.md` §5): пушей
 * на бекенде нет (`CLAUDE.md` §11), тумблеры хранят намерение пользователя
 * локально, персистентно.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationsState {
  deadlines: boolean;
  taskReminders: boolean;
  newsPromo: boolean;
  hydrated: boolean;
  setDeadlines: (value: boolean) => void;
  setTaskReminders: (value: boolean) => void;
  setNewsPromo: (value: boolean) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      deadlines: true,
      taskReminders: true,
      newsPromo: false,
      hydrated: false,
      setDeadlines: (value) => set({ deadlines: value }),
      setTaskReminders: (value) => set({ taskReminders: value }),
      setNewsPromo: (value) => set({ newsPromo: value }),
    }),
    {
      name: 'academicspace.notifications',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        deadlines: state.deadlines,
        taskReminders: state.taskReminders,
        newsPromo: state.newsPromo,
      }),
      onRehydrateStorage: () => () => {
        useNotificationsStore.setState({ hydrated: true });
      },
    },
  ),
);
