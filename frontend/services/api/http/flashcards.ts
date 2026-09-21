import type {
  ApiFlashcardDeck,
  ApiFlashcardDeckDetail,
  CreateFlashcardDeckInput,
} from '@/mocks/handlers/flashcards';

import { apiFetch, notImplemented } from './client';

export function listDecks(): Promise<{
  quota: { used: number; limit: number };
  decks: ApiFlashcardDeck[];
}> {
  return apiFetch('GET', '/flashcards');
}

export function getDeck(deckId: string): Promise<ApiFlashcardDeckDetail | null> {
  return apiFetch('GET', `/flashcards/${deckId}`);
}

export function createDeck(_input: CreateFlashcardDeckInput): Promise<ApiFlashcardDeckDetail> {
  // Текст/фото (multipart) — форму проектирует Фаза 8.
  return notImplemented('POST /flashcards');
}

export function deleteDeck(deckId: string): Promise<{ ok: true }> {
  return notImplemented(`DELETE /flashcards/${deckId}`);
}

export function markKnown(
  deckId: string,
  cardId: string,
): Promise<{ deck: ApiFlashcardDeckDetail | null; xpAwarded: number }> {
  return notImplemented(`PATCH /flashcards/${deckId}/cards/${cardId}`);
}
