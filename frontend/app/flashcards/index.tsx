import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, ProgressBar, TileIcon } from '@/components/atoms';
import { FlashcardDeckRow } from '@/components/molecules';
import { SlideUp } from '@/components/motion';
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
  const quotaProgress = quota.limit > 0 ? quota.used / quota.limit : 0;

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
        below={
          <ProgressBar
            value={quotaProgress}
            height={4}
            trackColor={palette.border}
            fillColor={accent.blue}
          />
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          decks.length === 0 && styles.contentEmpty,
          { paddingBottom: insets.bottom + 130 },
        ]}
      >
        {decks.length === 0 ? (
          <SlideUp style={styles.emptyWrap}>
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyIcon}>
                <TileIcon name="flashcards" />
              </View>
            </View>
            <Text style={[bodyFont('800'), styles.emptyTitle, { color: palette.ink }]}>
              Пока нет ни одной колоды
            </Text>
            <Text style={[bodyFont('500'), styles.emptySub, { color: palette.sub }]}>
              Опишите тему, которую не поняли, текстом или фото конспекта — ИИ соберёт карточки
              вопрос-ответ для повторения
            </Text>
            <View style={styles.emptyExamples}>
              {['«Неправильные глаголы»', '«Формулы физики»', 'Фото конспекта'].map((ex) => (
                <View key={ex} style={[styles.exampleChip, { backgroundColor: palette.chip }]}>
                  <Text style={[bodyFont('600'), styles.exampleChipText, { color: palette.sub }]}>
                    {ex}
                  </Text>
                </View>
              ))}
            </View>
          </SlideUp>
        ) : (
          <View style={styles.list}>
            {decks.map((d, i) => (
              <SlideUp key={d.id} delayMs={i * 50}>
                <FlashcardDeckRow
                  title={d.title}
                  source={d.source}
                  cardsTotal={d.cardsTotal}
                  cardsRemaining={d.cardsRemaining}
                  onPress={() =>
                    router.push({ pathname: '/flashcards/[deckId]', params: { deckId: d.id } })
                  }
                  onDelete={() => deleteDeck.mutate(d.id)}
                />
              </SlideUp>
            ))}
          </View>
        )}

        {!quotaFree && isPremium ? (
          <View style={[styles.limitNote, { backgroundColor: palette.chip }]}>
            <Icon name="lock" size={13} color={palette.sub} />
            <Text style={[bodyFont('600'), styles.limitNoteText, { color: palette.sub }]}>
              Достигнут лимит в {quota.limit} колод — удалите одну, чтобы создать новую
            </Text>
          </View>
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
  contentEmpty: { flexGrow: 1, justifyContent: 'center' },
  list: { gap: 10 },
  emptyWrap: { alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingBottom: 40 },
  emptyIconOuter: {
    width: 88,
    height: 88,
    borderRadius: radius.xxl,
    backgroundColor: '#EFE9FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.lg, overflow: 'hidden' },
  emptyTitle: { fontSize: 16, textAlign: 'center' },
  emptySub: { fontSize: 12.5, lineHeight: 19, textAlign: 'center', maxWidth: 280 },
  emptyExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    marginTop: 6,
  },
  exampleChip: { borderRadius: radius.sm, paddingHorizontal: 11, paddingVertical: 7 },
  exampleChipText: { fontSize: 11 },
  limitNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: 12,
  },
  limitNoteText: { fontSize: 11.5, flex: 1, lineHeight: 16 },
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
