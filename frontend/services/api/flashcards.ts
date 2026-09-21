/**
 * Адаптер-seam ресурса «flashcards» (умные карточки). Развилка мок/HTTP —
 * по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/flashcards';

import * as http from './http/flashcards';

export type {
  ApiFlashcardCard,
  ApiFlashcardDeck,
  ApiFlashcardDeckDetail,
  CreateFlashcardDeckInput,
} from '@/mocks/handlers/flashcards';

export interface FlashcardsApi {
  listDecks(): Promise<{ quota: { used: number; limit: number }; decks: mock.ApiFlashcardDeck[] }>;
  getDeck(deckId: string): Promise<mock.ApiFlashcardDeckDetail | null>;
  createDeck(input: mock.CreateFlashcardDeckInput): Promise<mock.ApiFlashcardDeckDetail>;
  deleteDeck(deckId: string): Promise<{ ok: true }>;
  markKnown(
    deckId: string,
    cardId: string,
  ): Promise<{ deck: mock.ApiFlashcardDeckDetail | null; xpAwarded: number }>;
}

export const flashcardsApi: FlashcardsApi = {
  listDecks: ENV.useMocks ? mock.listDecks : http.listDecks,
  getDeck: ENV.useMocks ? mock.getDeck : http.getDeck,
  createDeck: ENV.useMocks ? mock.createDeck : http.createDeck,
  deleteDeck: ENV.useMocks ? mock.deleteDeck : http.deleteDeck,
  markKnown: ENV.useMocks ? mock.markKnown : http.markKnown,
};
