/**
 * Единый мок-стор состояния сессии — эквивалент `state` из `renderVals()`
 * дизайн-референса (анкета / фильтры / задачи / сообщения / тарифы /
 * оплата / копилки). Персистентный через AsyncStorage, чтобы демо
 * переживало перезапуск приложения (роадмап, Фаза 4).
 *
 * Хендлеры `mocks/handlers/*` читают/пишут сюда и отдают данные в
 * API-форме (`docs/api-contract.md`). Экраны для «стейта в моменте»
 * (выбор в фильтрах, чек-боксы) дёргают сеттеры напрямую (`CLAUDE.md` §5).
 * Фаза 8 меняет адаптер в хендлерах на реальный fetch — форма не меняется.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CHAT_MODULE_TASK, TASKS_SEED, type SingleFilterKey, type TaskSeed } from './fixtures';

export type PlanChoice = 'week' | 'month';
export type PayState = 'idle' | 'processing' | 'success';

export interface ChatModuleSeed {
  title: string;
  sub: string;
  desc: string;
  created: boolean;
}

export interface ChatMsgSeed {
  id: string;
  fromMe: boolean;
  text: string;
  module?: ChatModuleSeed;
}

const MESSAGES_SEED: ChatMsgSeed[] = [
  {
    id: 'm1',
    fromMe: false,
    text: 'Ваша стратегия готова. Основной разрыв — язык: IELTS 6.5 открывает 9 из 14 подобранных программ. Предлагаю зафиксировать это как дорожную карту на 8 недель.',
  },
  { id: 'm2', fromMe: true, text: 'Давай, и ещё про мотивационное письмо' },
  {
    id: 'm3',
    fromMe: false,
    text: 'Хорошо. Оформлю подготовку к IELTS дорожной картой, а письмо — чек-листом, чтобы они были на главном экране, а не в переписке.',
    module: {
      title: 'Дорожная карта: IELTS 6.5',
      sub: '8 недель · 6 этапов',
      desc: 'Модуль появится в блоке «Активные задачи» на главной. Отмечать пункты можно не заходя в чат.',
      created: false,
    },
  },
];

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
  messages: MESSAGES_SEED,
  chatTyping: false,
  uploadSlots: [true, true, false, false],
  analysisDone: false,
  planChoice: 'month' as PlanChoice,
  payState: 'idle' as PayState,
  vaultCells: [true, true, true, false, false, false, false],
};

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

      toggleTaskItem: (taskId, itemIndex) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  items: t.items.map((it, i) => (i !== itemIndex ? it : { ...it, done: !it.done })),
                },
          ),
        })),

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

      resetMock: () => set(clone(INITIAL)),
    }),
    {
      name: 'academicspace.mock',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        interests: s.interests,
        filters: s.filters,
        questionnaireFilled: s.questionnaireFilled,
        tasks: s.tasks,
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
