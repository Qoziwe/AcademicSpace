import type {
  ApiFlashcardDeck,
  ApiFlashcardDeckDetail,
  CreateFlashcardDeckInput,
} from '@/mocks/handlers/flashcards';

import { apiFetch } from './client';

export function listDecks(): Promise<{
  quota: { used: number; limit: number };
  decks: ApiFlashcardDeck[];
}> {
  return apiFetch('GET', '/flashcards');
}

export function getDeck(deckId: string): Promise<ApiFlashcardDeckDetail | null> {
  return apiFetch('GET', `/flashcards/${deckId}`);
}

export function createDeck(input: CreateFlashcardDeckInput): Promise<ApiFlashcardDeckDetail> {
  // Фото конспекта на фронте — пока мок file-picker (реальных байт не
  // уходит), генерация всегда идёт от `text`; см. `app/flashcards/create.tsx`.
  return apiFetch('POST', '/flashcards', input);
}

export function deleteDeck(deckId: string): Promise<{ ok: true }> {
  return apiFetch('DELETE', `/flashcards/${deckId}`);
}

export function markKnown(
  deckId: string,
  cardId: string,
): Promise<{ deck: ApiFlashcardDeckDetail | null; xpAwarded: number }> {
  return apiFetch('PATCH', `/flashcards/${deckId}/cards/${cardId}`);
}
