/**
 * Умные карточки (`GET/POST/DELETE /api/v1/flashcards`,
 * `PATCH /api/v1/flashcards/:deckId/cards/:cardId`).
 *  - `useFlashcardDecks()` — список колод + квота (FLASHCARDS_LIST);
 *  - `useFlashcardDeck(id)` — одна колода (FLASHCARDS_STUDY);
 *  - `useCreateFlashcardDeck()` — генерация (FLASHCARDS_CREATE);
 *  - `useDeleteFlashcardDeck()` — освободить слот квоты;
 *  - `useMarkFlashcardKnown()` — свайп влево. Если колода закрылась этим
 *    свайпом (`xpAwarded > 0`), начисление уже произошло в мок-сторе —
 *    инвалидируем профиль и журнал, как `useToggleTaskItem`.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { flashcardsApi } from '@/services/api/flashcards';

export function useFlashcardDecks() {
  return useQuery({ queryKey: qk.flashcards(), queryFn: flashcardsApi.listDecks });
}

export function useFlashcardDeck(deckId: string) {
  return useQuery({
    queryKey: qk.flashcardDeck(deckId),
    queryFn: () => flashcardsApi.getDeck(deckId),
  });
}

export function useCreateFlashcardDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.createDeck,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.flashcards() }),
  });
}

export function useDeleteFlashcardDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.deleteDeck,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.flashcards() }),
  });
}

export function useMarkFlashcardKnown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deckId, cardId }: { deckId: string; cardId: string }) =>
      flashcardsApi.markKnown(deckId, cardId),
    onSuccess: (data, { deckId }) => {
      void qc.invalidateQueries({ queryKey: qk.flashcards() });
      void qc.invalidateQueries({ queryKey: qk.flashcardDeck(deckId) });
      if (data.xpAwarded > 0) {
        void qc.invalidateQueries({ queryKey: ['profile'] });
        void qc.invalidateQueries({ queryKey: qk.achievementLog() });
      }
    },
  });
}
