/**
 * Мок-хендлер умных карточек. Контракт — `docs/api-contract.md` §Flashcards.
 * "Генерация" не читает реальный текст/фото — берёт готовый набор из
 * `FLASHCARD_MOCK_BANK` (см. `mocks/store.ts.createFlashcardDeck`), как и
 * `mocks/handlers/analysis.ts` не зависит от содержимого портфолио.
 *
 * Лимит одновременно хранимых колод (`FLASHCARD_QUOTAS`) читается из тарифа
 * мок-сессии — колоду можно удалить, чтобы освободить слот.
 */

import { delay } from '@/mocks/delay';
import { FLASHCARD_QUOTAS, type FlashcardDeckSeed } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { useSessionStore } from '@/stores/session';

export interface ApiFlashcardDeck {
  id: string;
  title: string;
  source: 'text' | 'image';
  createdAt: string;
  cardsTotal: number;
  cardsRemaining: number;
}

export interface ApiFlashcardCard {
  id: string;
  question: string;
  answer: string;
}

export interface ApiFlashcardDeckDetail extends ApiFlashcardDeck {
  cards: ApiFlashcardCard[];
}

export interface CreateFlashcardDeckInput {
  source: 'text' | 'image';
  text?: string;
}

export class FlashcardQuotaError extends Error {
  constructor() {
    super('flashcards_quota_exceeded');
    this.name = 'FlashcardQuotaError';
  }
}

function quotaLimit(): number {
  const isPremium = useSessionStore.getState().plan === 'premium';
  return isPremium ? FLASHCARD_QUOTAS.premium : FLASHCARD_QUOTAS.free;
}

function toApiDeck(d: FlashcardDeckSeed): ApiFlashcardDeck {
  return {
    id: d.id,
    title: d.title,
    source: d.source,
    createdAt: d.createdAt,
    cardsTotal: d.cardsTotal,
    cardsRemaining: d.cards.length,
  };
}

export function listDecks(): Promise<{
  quota: { used: number; limit: number };
  decks: ApiFlashcardDeck[];
}> {
  const decks = useMockStore.getState().flashcardDecks;
  return delay({ quota: { used: decks.length, limit: quotaLimit() }, decks: decks.map(toApiDeck) });
}

export function getDeck(deckId: string): Promise<ApiFlashcardDeckDetail | null> {
  const deck = useMockStore.getState().flashcardDecks.find((d) => d.id === deckId);
  if (!deck) return delay(null);
  return delay({ ...toApiDeck(deck), cards: deck.cards });
}

export function createDeck(input: CreateFlashcardDeckInput): Promise<ApiFlashcardDeckDetail> {
  if (useMockStore.getState().flashcardDecks.length >= quotaLimit()) {
    return Promise.reject(new FlashcardQuotaError());
  }
  const deckId = useMockStore.getState().createFlashcardDeck({ source: input.source });
  const deck = useMockStore.getState().flashcardDecks.find((d) => d.id === deckId);
  // Задержка эмулирует время работы "нейронки" (генерация, не сетевой лаг).
  return delay({ ...toApiDeck(deck!), cards: deck!.cards }, 1800);
}

export function deleteDeck(deckId: string): Promise<{ ok: true }> {
  useMockStore.getState().deleteFlashcardDeck(deckId);
  return delay({ ok: true });
}

export function markKnown(
  deckId: string,
  cardId: string,
): Promise<{ deck: ApiFlashcardDeckDetail | null; xpAwarded: number }> {
  const xpBefore = useMockStore.getState().xp;
  useMockStore.getState().markFlashcardKnown(deckId, cardId);
  const xpAwarded = useMockStore.getState().xp - xpBefore;
  const deck = useMockStore.getState().flashcardDecks.find((d) => d.id === deckId) ?? null;
  return delay({ deck: deck ? { ...toApiDeck(deck), cards: deck.cards } : null, xpAwarded });
}
