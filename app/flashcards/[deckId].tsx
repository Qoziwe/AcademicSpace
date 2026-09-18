import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/atoms';
import { FlashcardStack, HeaderBar } from '@/components/organisms';
import { useFlashcardDeck, useMarkFlashcardKnown } from '@/hooks/api/useFlashcards';
import { useTheme } from '@/hooks/useTheme';
import { FLASHCARD_DECK_XP } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius, spacing } from '@/theme';

/**
 * FLASHCARDS_STUDY (`/flashcards/:deckId`). Тело — `<FlashcardStack>`
 * (свайпы: влево — запомнил, вправо — перевернуть/дальше). `key={deckId}`
 * пересоздаёт стек при смене колоды — своя локальная очередь на колоду.
 * Когда стек опустошается — инлайн-завершение на этом же экране (без
 * отдельного роута, `CLAUDE.md` §7 — не плодить ID без визуальной нужды).
 */
function FlashcardsStudyScreen() {
  const { palette } = useTheme();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const deckQ = useFlashcardDeck(deckId ?? '');
  const markKnown = useMarkFlashcardKnown();
  const [justFinished, setJustFinished] = useState(false);

  const deck = deckQ.data;

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title={deck?.title ?? 'Колода'}
        sub="умные карточки"
        onBack={backOr('/flashcards')}
      />

      <View style={styles.body}>
        {deckQ.isLoading ? (
          <ActivityIndicator color={accent.blue} />
        ) : !deck ? (
          <View style={styles.center}>
            <Text style={[bodyFont('700'), styles.missingTitle, { color: palette.ink }]}>
              Колода не найдена
            </Text>
            <Text style={[bodyFont('500'), styles.missingSub, { color: palette.sub }]}>
              Возможно, она уже удалена
            </Text>
            <Button label="К списку колод" onPress={() => router.replace('/flashcards')} />
          </View>
        ) : deck.cards.length === 0 && !justFinished ? (
          <View
            style={[
              styles.doneCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Text style={[bodyFont('700'), styles.doneTitle, { color: palette.ink }]}>
              Колода уже пройдена ✓
            </Text>
            <Text style={[bodyFont('500'), styles.doneSub, { color: palette.sub }]}>
              Все карточки запомнены. Удалите колоду со списка, чтобы освободить слот для новой.
            </Text>
            <Button label="К списку колод" onPress={() => router.replace('/flashcards')} />
          </View>
        ) : justFinished ? (
          <View
            style={[
              styles.doneCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={[bodyFont('700'), styles.doneTitle, { color: palette.ink }]}>
              Колода пройдена!
            </Text>
            <Text style={[bodyFont('500'), styles.doneSub, { color: accent.green }]}>
              +{FLASHCARD_DECK_XP} XP
            </Text>
            <View style={styles.doneActions}>
              <Button
                label="К списку колод"
                variant="secondary"
                onPress={() => router.replace('/flashcards')}
              />
              <Button label="На главную" onPress={() => router.replace('/dashboard')} />
            </View>
          </View>
        ) : (
          <FlashcardStack
            key={deck.id}
            initialCards={deck.cards}
            cardsTotal={deck.cardsTotal}
            onKnown={(cardId) => markKnown.mutate({ deckId: deck.id, cardId })}
            onEmpty={() => setJustFinished(true)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, padding: 18, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: 10 },
  missingTitle: { fontSize: 14 },
  missingSub: { fontSize: 12.5, marginBottom: 8 },
  doneCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 26,
    alignItems: 'center',
    gap: 8,
  },
  doneEmoji: { fontSize: 34 },
  doneTitle: { fontSize: 16 },
  doneSub: { fontSize: 13, marginBottom: 4 },
  doneActions: { alignSelf: 'stretch', gap: spacing.md, marginTop: 10 },
});

export default withGuard(FlashcardsStudyScreen, { auth: true });
