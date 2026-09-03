/**
 * Единый мок-стор состояния сессии — эквивалент `state` из `renderVals()`
 * дизайн-референса (анкета / фильтры / задачи / сообщения / тарифы /
 * оплата / копилки / XP / журнал / офлайн). Персистентный через
 * AsyncStorage, чтобы демо переживало перезапуск приложения (роадмап,
 * Фаза 4).
 *
 * Хендлеры `mocks/handlers/*` читают/пишут сюда и отдают данные в
 * API-форме (`docs/api-contract.md`). Экраны для «стейта в моменте»
 * (выбор в фильтрах, чек-боксы, офлайн-баннер) дёргают сеттеры напрямую
 * (`CLAUDE.md` §5). Фаза 8 меняет адаптер в `services/api/*` на реальный
 * fetch — форма не меняется.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  CHAT_MESSAGES_SEED,
  CHAT_MODULE_TASK,
  PROFILE,
  TASK_KIND_LOG,
  TASKS_SEED,
  type ChatMsgSeed,
  type LogEntry,
  type SingleFilterKey,
  type TaskSeed,
} from './fixtures';

export type { ChatModuleSeed, ChatMsgSeed } from './fixtures';

export type PlanChoice = 'week' | 'month';
export type PayState = 'idle' | 'processing' | 'success';

interface MockState {
  hydrated: boolean;

  // анкета + фильтры (шаги 1–6 мастера)
  interests: string[];
  filters: {
    country: string;
    universities: string[];
    faculty: string;
    language: string;
    cost: string;
  };
  questionnaireFilled: boolean;

  // задачи / модули
  tasks: TaskSeed[];

  // геймификация: опыт растёт при закрытии модулей, записи копятся в журнал
  xp: number;
  journalEntries: LogEntry[];

  // чат
  messages: ChatMsgSeed[];
  chatTyping: boolean;

  // ИИ-анализ портфолио
  uploadSlots: boolean[];
  analysisDone: boolean;

  // подписка / оплата
  planChoice: PlanChoice;
  payState: PayState;

  // копилка документов
  vaultCells: boolean[];

  // глобальный офлайн-баннер (эфемерный — не персистится)
  offline: boolean;

  // ── сеттеры ────────────────────────────────────────────────
  toggleInterest: (label: string) => void;
  setFilter: (key: SingleFilterKey, value: string) => void;
  toggleUniversity: (name: string) => void;
  setQuestionnaireFilled: (filled: boolean) => void;

  toggleTaskItem: (taskId: string, itemIndex: number) => void;
  addChatModuleTask: () => void;

  appendMessage: (msg: ChatMsgSeed) => void;
  setChatTyping: (typing: boolean) => void;
  markModuleCreated: (messageId: string) => void;

  toggleUploadSlot: (index: number) => void;
  setAnalysisDone: (done: boolean) => void;

  setPlanChoice: (plan: PlanChoice) => void;
  setPayState: (state: PayState) => void;

  toggleVaultCell: (index: number) => void;

  setOffline: (offline: boolean) => void;

  resetMock: () => void;
}

const INITIAL = {
  interests: ['Инженерия', 'Технологии'],
  filters: {
    country: 'Италия',
    universities: ['Università di Bologna', 'Università di Padova'],
    faculty: 'Инженерия',
    language: 'Английский',
    cost: 'до 3 000 € + стипендия',
  },
  questionnaireFilled: false,
  tasks: TASKS_SEED,
  xp: PROFILE.xp,
  journalEntries: [] as LogEntry[],
  messages: CHAT_MESSAGES_SEED,
  chatTyping: false,
  uploadSlots: [true, true, false, false],
  analysisDone: false,
  planChoice: 'month' as PlanChoice,
  payState: 'idle' as PayState,
  vaultCells: [true, true, true, false, false, false, false],
  offline: false,
};

/** Поля, которые переживают перезапуск. `offline` намеренно не здесь. */
type MockPersisted = Pick<
  MockState,
  | 'interests'
  | 'filters'
  | 'questionnaireFilled'
  | 'tasks'
  | 'xp'
  | 'journalEntries'
  | 'messages'
  | 'uploadSlots'
  | 'analysisDone'
  | 'planChoice'
  | 'payState'
  | 'vaultCells'
>;

// Глубокая копия сидов, чтобы сеттеры не мутировали фикстуры-константы.
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const useMockStore = create<MockState>()(
  persist(
    (set) => ({
      hydrated: false,
      ...clone(INITIAL),

      toggleInterest: (label) =>
        set((s) => ({
          interests: s.interests.includes(label)
            ? s.interests.filter((x) => x !== label)
            : [...s.interests, label],
        })),

      setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

      toggleUniversity: (name) =>
        set((s) => ({
          filters: {
            ...s.filters,
            universities: s.filters.universities.includes(name)
              ? s.filters.universities.filter((x) => x !== name)
              : [...s.filters.universities, name],
          },
        })),

      setQuestionnaireFilled: (filled) => set({ questionnaireFilled: filled }),

      /**
       * Переключает пункт чек-листа. Если после этого все пункты модуля
       * закрыты — модуль завершается: уходит из активных, его XP
       * начисляется в `xp`, а в журнал (`journalEntries`) добавляется
       * запись. Прогресс персистится, так что переживает перезапуск.
       */
      toggleTaskItem: (taskId, itemIndex) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;

          const items = task.items.map((it, i) =>
            i === itemIndex ? { ...it, done: !it.done } : it,
          );
          const complete = items.length > 0 && items.every((it) => it.done);

          if (!complete) {
            return {
              tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, items } : t)),
            };
          }

          const map = TASK_KIND_LOG[task.kind];
          const entry: LogEntry = {
            title: task.title,
            kind: map.kind,
            xp: task.xp,
            dot: map.dot,
          };
          return {
            tasks: s.tasks.filter((t) => t.id !== taskId),
            xp: s.xp + task.xp,
            journalEntries: [entry, ...s.journalEntries],
          };
        }),

      addChatModuleTask: () =>
        set((s) =>
          s.tasks.some((t) => t.id === CHAT_MODULE_TASK.id)
            ? s
            : { tasks: [...s.tasks, clone(CHAT_MODULE_TASK)] },
        ),

      appendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setChatTyping: (typing) => set({ chatTyping: typing }),
      markModuleCreated: (messageId) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === messageId && m.module ? { ...m, module: { ...m.module, created: true } } : m,
          ),
        })),

      toggleUploadSlot: (index) =>
        set((s) => ({ uploadSlots: s.uploadSlots.map((v, i) => (i === index ? !v : v)) })),
      setAnalysisDone: (done) => set({ analysisDone: done }),

      setPlanChoice: (plan) => set({ planChoice: plan }),
      setPayState: (state) => set({ payState: state }),

      toggleVaultCell: (index) =>
        set((s) => ({ vaultCells: s.vaultCells.map((v, i) => (i === index ? !v : v)) })),

      setOffline: (offline) => set({ offline }),

      resetMock: () => set(clone(INITIAL)),
    }),
    {
      name: 'academicspace.mock',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, from) => {
        // v1 → v2: добавились xp / journalEntries. Остальной прогресс демо
        // (задачи, фильтры, чат) сохраняем как есть.
        if (from >= 2) return persisted as MockPersisted;
        const p = (persisted ?? {}) as Partial<MockPersisted>;
        return { ...p, xp: p.xp ?? INITIAL.xp, journalEntries: p.journalEntries ?? [] };
      },
      partialize: (s): MockPersisted => ({
        interests: s.interests,
        filters: s.filters,
        questionnaireFilled: s.questionnaireFilled,
        tasks: s.tasks,
        xp: s.xp,
        journalEntries: s.journalEntries,
        messages: s.messages,
        uploadSlots: s.uploadSlots,
        analysisDone: s.analysisDone,
        planChoice: s.planChoice,
        payState: s.payState,
        vaultCells: s.vaultCells,
      }),
      onRehydrateStorage: () => () => {
        useMockStore.setState({ hydrated: true });
      },
    },
  ),
);
