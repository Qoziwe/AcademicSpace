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
  FLASHCARD_DECK_XP,
  FLASHCARD_MOCK_BANK,
  PROFILE,
  TASK_KIND_LOG,
  TASKS_SEED,
  type ChatMsgSeed,
  type FlashcardDeckSeed,
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

  // умные карточки
  flashcardDecks: FlashcardDeckSeed[];

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

  createFlashcardDeck: (input: { source: 'text' | 'image' }) => string;
  deleteFlashcardDeck: (deckId: string) => void;
  markFlashcardKnown: (deckId: string, cardId: string) => void;

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
  flashcardDecks: [] as FlashcardDeckSeed[],
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
  | 'flashcardDecks'
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

      /**
       * Мок-"нейронка": не читает текст/фото, а детерминированно берёт один
       * из заготовленных наборов (`FLASHCARD_MOCK_BANK`), ротация по
       * количеству уже созданных колод. Карточкам присваивается ID с
       * префиксом колоды, чтобы не пересекались между колодами.
       */
      createFlashcardDeck: (input) => {
        const id = `fc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        set((s) => {
          const bank = FLASHCARD_MOCK_BANK[s.flashcardDecks.length % FLASHCARD_MOCK_BANK.length];
          const deck: FlashcardDeckSeed = {
            id,
            title: bank?.title ?? 'Новая колода',
            source: input.source,
            createdAt: new Date().toISOString(),
            cardsTotal: bank?.cards.length ?? 0,
            cards: (bank?.cards ?? []).map((c) => ({ ...c, id: `${id}_${c.id}` })),
          };
          return { flashcardDecks: [deck, ...s.flashcardDecks] };
        });
        return id;
      },

      deleteFlashcardDeck: (deckId) =>
        set((s) => ({ flashcardDecks: s.flashcardDecks.filter((d) => d.id !== deckId) })),

      /**
       * Убирает карточку из колоды (свайп влево — "запомнил"). Если это была
       * последняя карточка — колода "пройдена": начисляем XP и пишем запись
       * в журнал, как при закрытии модуля (`toggleTaskItem`). Сама колода
       * остаётся в списке (пустой) до явного удаления — освобождает слот
       * квоты только по действию пользователя.
       */
      markFlashcardKnown: (deckId, cardId) =>
        set((s) => {
          const deck = s.flashcardDecks.find((d) => d.id === deckId);
          if (!deck) return s;

          const cards = deck.cards.filter((c) => c.id !== cardId);
          const decks = s.flashcardDecks.map((d) => (d.id === deckId ? { ...d, cards } : d));
          const justCompleted = cards.length === 0 && deck.cards.length > 0;

          if (!justCompleted) return { flashcardDecks: decks };

          const entry: LogEntry = {
            title: deck.title,
            kind: 'умные карточки',
            xp: FLASHCARD_DECK_XP,
            dot: 'rose',
          };
          return {
            flashcardDecks: decks,
            xp: s.xp + FLASHCARD_DECK_XP,
            journalEntries: [entry, ...s.journalEntries],
          };
        }),

      setOffline: (offline) => set({ offline }),

      resetMock: () => set(clone(INITIAL)),
    }),
    {
      name: 'academicspace.mock',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, from) => {
        // v1 → v2: добавились xp / journalEntries.
        // v2 → v3: добавились flashcardDecks. Остальной прогресс демо
        // (задачи, фильтры, чат) сохраняем как есть.
        const p = (persisted ?? {}) as Partial<MockPersisted>;
        const v2 =
          from >= 2 ? p : { ...p, xp: p.xp ?? INITIAL.xp, journalEntries: p.journalEntries ?? [] };
        return { ...v2, flashcardDecks: v2.flashcardDecks ?? [] } as MockPersisted;
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
        flashcardDecks: s.flashcardDecks,
      }),
      onRehydrateStorage: () => () => {
        useMockStore.setState({ hydrated: true });
      },
    },
  ),
);
