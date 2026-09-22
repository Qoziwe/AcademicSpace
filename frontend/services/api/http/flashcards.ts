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

async function toBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return res.blob();
}

export async function createDeck(input: CreateFlashcardDeckInput): Promise<ApiFlashcardDeckDetail> {
  if (!input.images || input.images.length === 0) {
    return apiFetch('POST', '/flashcards', { source: input.source, text: input.text });
  }

  const form = new FormData();
  form.append('source', input.source);
  if (input.text) form.append('text', input.text);
  const blobs = await Promise.all(input.images.map(toBlob));
  blobs.forEach((blob, i) => form.append('images', blob, `photo-${i}.jpg`));

  return apiFetch('POST', '/flashcards', form);
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
