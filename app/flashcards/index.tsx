import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/atoms';
import { FlashcardDeckRow } from '@/components/molecules';
import { HeaderBar } from '@/components/organisms';
import { useDeleteFlashcardDeck, useFlashcardDecks } from '@/hooks/api/useFlashcards';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, navy, radius } from '@/theme';

/**
 * FLASHCARDS_LIST (`/flashcards`). Free — 1 колода одновременно, Premium —
 * 10; удаление освобождает слот (`CLAUDE.md` §6, свой quota-паттерн: тайл
 * входа не залочен, ограничение — контекстно на CTA «Создать»).
 */
function FlashcardsListScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { isPremium } = usePremiumGate();
  const decksQ = useFlashcardDecks();
  const deleteDeck = useDeleteFlashcardDeck();

  const decks = decksQ.data?.decks ?? [];
  const quota = decksQ.data?.quota ?? { used: 0, limit: isPremium ? 10 : 1 };
  const quotaFree = quota.used < quota.limit;

  const createGo = () => {
    if (quotaFree) router.push('/flashcards/create');
    else if (!isPremium) router.push('/subscription/offer');
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Умные карточки"
        sub={`${quota.used} из ${quota.limit} колод`}
        onBack={backOr('/dashboard')}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 130 }]}>
        {decks.length === 0 ? (
          <View
            style={[styles.empty, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[bodyFont('700'), styles.emptyTitle, { color: palette.ink }]}>
              Пока нет ни одной колоды
            </Text>
            <Text style={[bodyFont('500'), styles.emptySub, { color: palette.sub }]}>
              Опишите тему, которую не поняли, текстом или фото конспекта — ИИ соберёт карточки
              вопрос-ответ для повторения
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {decks.map((d) => (
              <FlashcardDeckRow
                key={d.id}
                title={d.title}
                source={d.source}
                cardsTotal={d.cardsTotal}
                cardsRemaining={d.cardsRemaining}
                onPress={() =>
                  router.push({ pathname: '/flashcards/[deckId]', params: { deckId: d.id } })
                }
                onDelete={() => deleteDeck.mutate(d.id)}
              />
            ))}
          </View>
        )}

        {!quotaFree && isPremium ? (
          <Text style={[bodyFont('500'), styles.limitNote, { color: palette.sub }]}>
            Достигнут лимит в {quota.limit} колод — удалите одну, чтобы создать новую
          </Text>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: palette.screen, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={createGo}
          disabled={!quotaFree && isPremium}
          style={{ opacity: !quotaFree && isPremium ? 0.5 : 1 }}
        >
          <LinearGradient
            colors={quotaFree ? [navy.deep, '#2E6BFF'] : [navy.primary, navy.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            {quotaFree ? (
              <View style={styles.ctaDiamond} />
            ) : (
              <Icon name="lock" size={14} color={accent.gold} />
            )}
            <Text style={[bodyFont('800'), styles.ctaText]}>
              {quotaFree ? 'Создать колоду' : isPremium ? 'Лимит колод' : 'Открыть Premium'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 12 },
  list: { gap: 10 },
  empty: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 14 },
  emptySub: { fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  limitNote: { fontSize: 11.5, textAlign: 'center', marginTop: 4 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  cta: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaDiamond: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#F3C24B',
    transform: [{ rotate: '45deg' }],
  },
  ctaText: { fontSize: 15, color: '#FFFFFF' },
});

export default withGuard(FlashcardsListScreen, { auth: true });
