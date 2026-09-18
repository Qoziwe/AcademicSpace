import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextField } from '@/components/atoms';
import { DocumentCell } from '@/components/molecules';
import { HeaderBar } from '@/components/organisms';
import { useCreateFlashcardDeck } from '@/hooks/api/useFlashcards';
import { useTheme } from '@/hooks/useTheme';
import { FLASHCARD_IMAGE_SLOTS } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { bodyFont, navy, radius } from '@/theme';

type Mode = 'text' | 'image';

/**
 * FLASHCARDS_CREATE (`/flashcards/create`). Текст или фото (мок file-picker,
 * как `PORTFOLIO_UPLOAD`) → генерация (`useCreateFlashcardDeck`). Экран сам
 * дожидается результата мутации и уводит на конкретную колоду — GENERATING
 * между ними чисто декоративный (id колоды известен только после ответа).
 */
function FlashcardsCreateScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [imageSlots, setImageSlots] = useState<boolean[]>(() =>
    FLASHCARD_IMAGE_SLOTS.map(() => false),
  );
  const create = useCreateFlashcardDeck();

  const toggleSlot = (i: number) =>
    setImageSlots((slots) => slots.map((v, idx) => (idx === i ? !v : v)));

  const canSubmit = mode === 'text' ? text.trim().length > 0 : imageSlots.some((v) => v);

  const submit = async () => {
    if (!canSubmit || create.isPending) return;
    router.push('/flashcards/generating');
    try {
      const deck = await create.mutateAsync({
        source: mode,
        text: mode === 'text' ? text.trim() : undefined,
      });
      router.replace({ pathname: '/flashcards/[deckId]', params: { deckId: deck.id } });
    } catch {
      router.replace('/flashcards');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: palette.screen }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HeaderBar title="Новая колода" sub="что разбираем?" onBack={backOr('/flashcards')} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        <View style={[styles.segment, { backgroundColor: palette.border }]}>
          <SegmentTab label="Текст" active={mode === 'text'} onPress={() => setMode('text')} />
          <SegmentTab label="Фото" active={mode === 'image'} onPress={() => setMode('image')} />
        </View>

        {mode === 'text' ? (
          <TextField
            label="Опишите тему, которую не поняли"
            value={text}
            onChangeText={setText}
            placeholder="Например: не понимаю, как решать квадратные уравнения через дискриминант…"
            multiline
            numberOfLines={7}
          />
        ) : (
          <View style={styles.slots}>
            {FLASHCARD_IMAGE_SLOTS.map((slot, i) => (
              <DocumentCell
                key={slot.title}
                title={slot.title}
                sub={slot.filledSub}
                emptySub="фото не добавлено"
                filled={imageSlots[i] ?? false}
                onPress={() => toggleSlot(i)}
                actionFilledLabel="добавлено"
                actionEmptyLabel="добавить фото"
              />
            ))}
          </View>
        )}

        <Text style={[bodyFont('500'), styles.note, { color: palette.sub }]}>
          ИИ разберёт материал и соберёт карточки «вопрос → ответ» для повторения — обычно это
          занимает пару секунд.
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: palette.screen, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Pressable accessibilityRole="button" onPress={submit} disabled={!canSubmit}>
          <LinearGradient
            colors={[navy.deep, '#2E6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cta, { opacity: canSubmit ? 1 : 0.5 }]}
          >
            <View style={styles.ctaDiamond} />
            <Text style={[bodyFont('800'), styles.ctaText]}>Сгенерировать карточки</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function SegmentTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.segmentTab, active && { backgroundColor: palette.card }]}
    >
      <Text
        style={[bodyFont('700'), styles.segmentText, { color: active ? palette.ink : palette.sub }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 14 },
  segment: { flexDirection: 'row', borderRadius: radius.lg, padding: 4, gap: 4 },
  segmentTab: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: { fontSize: 13 },
  slots: { gap: 10 },
  note: { fontSize: 11.5, lineHeight: 17 },
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

export default withGuard(FlashcardsCreateScreen, { auth: true });
