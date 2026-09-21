/**
 * `<FlashcardStack>` — свайповый стек умных карточек (FLASHCARDS_STUDY,
 * §пользовательская спецификация): свайп влево — карточка запомнена и
 * уходит навсегда (`onKnown`); свайп вправо на лицевой стороне —
 * переворот (показать ответ); свайп вправо на обороте — следующая
 * карточка. Невыученная карточка не исчезает — уезжает в конец очереди и
 * вернётся на следующем круге («всегда случайный порядок появления»).
 *
 * Очередь (`queue`) — локальный стейт, перемешивается один раз при маунте
 * и дальше живёт сама по себе (родитель монтирует стек заново на смену
 * колоды через `key={deckId}`, `app/flashcards/[deckId].tsx`) — так
 * свайп не гоняется за асинхронным откликом мутации `useMarkFlashcardKnown`,
 * которая летит в фоне только чтобы освободить карточку в мок-сторе/XP.
 *
 * Жест — `Gesture.Pan` + Reanimated, тот же приём, что перетаскиваемая
 * пилюля таб-бара (`components/organisms/TabBar.tsx`) и шторка дашборда
 * (`app/dashboard.tsx`): анимация в UI-потоке, побочный эффект (смена
 * карточки) коммитится один раз через `runOnJS`. Кнопки под стеком —
 * дубли жеста для веба/десктопа без тача.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon, IconTile, ProgressBar } from '@/components/atoms';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, navy, radius, shadow, spacing } from '@/theme';

export interface FlashcardStackCard {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  initialCards: FlashcardStackCard[];
  cardsTotal: number;
  onKnown: (cardId: string) => void;
  onEmpty: () => void;
  style?: StyleProp<ViewStyle>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

const SNAP = { damping: 20, stiffness: 240, mass: 0.6 };
// Быстрый flat-timing вместо пружины — переворот ощущался затянутым
// (пружина с этими коэффициентами колебалась и оседала заметно дольше
// прямого тайминга при развороте на 180°).
const FLIP_DURATION = 240;
const FLIP_EASING = Easing.out(Easing.cubic);
const SWIPE_THRESHOLD = 110;
const EXIT_DISTANCE = 520;
const EXIT_DURATION = 220;

export function FlashcardStack({ initialCards, cardsTotal, onKnown, onEmpty, style }: Props) {
  const { palette } = useTheme();
  const [queue, setQueue] = useState<FlashcardStackCard[]>(() => shuffle(initialCards));
  const [isFlipped, setIsFlipped] = useState(false);

  const current = queue[0];
  const upNext = queue[1];
  const secondPeek = queue[2];

  const translateX = useSharedValue(0);
  const flipped = useSharedValue(0);

  const commitKnown = useCallback(
    (cardId: string) => {
      translateX.value = 0;
      flipped.value = 0;
      setIsFlipped(false);
      setQueue((q) => {
        const rest = q.filter((c) => c.id !== cardId);
        if (rest.length === 0) onEmpty();
        return rest;
      });
      onKnown(cardId);
    },
    [translateX, flipped, onKnown, onEmpty],
  );

  const commitAdvance = useCallback(() => {
    translateX.value = 0;
    flipped.value = 0;
    setIsFlipped(false);
    setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]!] : q));
  }, [translateX, flipped]);

  const triggerFlip = useCallback(() => {
    flipped.value = withTiming(1, { duration: FLIP_DURATION, easing: FLIP_EASING });
    translateX.value = withSpring(0, SNAP);
    setIsFlipped(true);
  }, [flipped, translateX]);

  const exitLeft = useCallback(
    (cardId: string) => {
      translateX.value = withTiming(-EXIT_DISTANCE, { duration: EXIT_DURATION }, (finished) => {
        if (finished) runOnJS(commitKnown)(cardId);
      });
    },
    [translateX, commitKnown],
  );

  const exitRight = useCallback(() => {
    translateX.value = withTiming(EXIT_DISTANCE, { duration: EXIT_DURATION }, (finished) => {
      if (finished) runOnJS(commitAdvance)();
    });
  }, [translateX, commitAdvance]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(current != null)
        .onUpdate((e) => {
          translateX.value = e.translationX;
        })
        .onEnd(() => {
          if (!current) return;
          if (translateX.value < -SWIPE_THRESHOLD) {
            runOnJS(exitLeft)(current.id);
          } else if (translateX.value > SWIPE_THRESHOLD) {
            if (flipped.value === 0) {
              runOnJS(triggerFlip)();
            } else {
              runOnJS(exitRight)();
            }
          } else {
            translateX.value = withSpring(0, SNAP);
          }
        }),
    [current, translateX, flipped, exitLeft, exitRight, triggerFlip],
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotateZ: `${interpolate(translateX.value, [-260, 0, 260], [-8, 0, 8], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));
  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipped.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipped.value, [0, 1], [180, 360])}deg` },
    ],
  }));
  const knownOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -30], [0.92, 0], Extrapolation.CLAMP),
  }));
  const nextOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [30, SWIPE_THRESHOLD], [0, 0.92], Extrapolation.CLAMP),
  }));

  if (!current) return null;

  const position = cardsTotal - queue.length + 1;

  return (
    <View style={[styles.root, style]}>
      <View style={styles.progressRow}>
        <View style={[styles.progressPill, { backgroundColor: palette.chip }]}>
          <Text style={[bodyFont('700'), styles.progress, { color: palette.sub }]}>
            {position} из {cardsTotal}
          </Text>
        </View>
        <ProgressBar
          value={cardsTotal > 0 ? (position - 1) / cardsTotal : 0}
          height={4}
          trackColor={palette.border}
          fillColor={accent.blue}
          style={styles.progressBar}
        />
      </View>

      <View style={styles.stack}>
        {secondPeek ? (
          <View style={[styles.card, styles.peekCard2, { backgroundColor: palette.card }]} />
        ) : null}
        {upNext ? (
          <View
            style={[styles.card, styles.peekCard, shadow.card, { backgroundColor: palette.card }]}
          >
            <Text
              numberOfLines={4}
              style={[bodyFont('700'), styles.peekText, { color: palette.sub }]}
            >
              {upNext.question}
            </Text>
          </View>
        ) : null}

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, shadow.card, cardStyle]}>
            <Animated.View style={[styles.face, frontFaceStyle]}>
              <LinearGradient
                colors={['#3A41A0', navy.primary]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.faceBlob} />
              <View style={styles.faceLabelRow}>
                <View style={styles.faceLabelDot} />
                <Text
                  style={[bodyFont('600'), styles.faceLabel, { color: 'rgba(255,255,255,0.6)' }]}
                >
                  ВОПРОС
                </Text>
              </View>
              <Text style={[bodyFont('700'), styles.faceText, { color: '#FFFFFF' }]}>
                {current.question}
              </Text>
              <Text style={[bodyFont('500'), styles.faceHint, { color: 'rgba(255,255,255,0.45)' }]}>
                свайп вправо — перевернуть
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.face,
                styles.faceBack,
                backFaceStyle,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <View style={styles.faceLabelRow}>
                <IconTile size={26} radius={9} tone="blueSoft">
                  <Icon name="check" size={13} color={accent.blue} strokeWidth={2} />
                </IconTile>
                <Text style={[bodyFont('700'), styles.faceLabel, { color: accent.blue }]}>
                  ОТВЕТ
                </Text>
              </View>
              <Text style={[bodyFont('700'), styles.faceText, { color: palette.ink }]}>
                {current.answer}
              </Text>
              <Text style={[bodyFont('500'), styles.faceHint, { color: palette.sub }]}>
                свайп вправо — дальше · влево — запомнил
              </Text>
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[styles.overlay, styles.overlayLeft, knownOverlayStyle]}
            >
              <Icon name="check" size={16} color="#FFFFFF" />
              <Text style={[bodyFont('800'), styles.overlayText]}>Запомнил</Text>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[styles.overlay, styles.overlayRight, nextOverlayStyle]}
            >
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
              <Text style={[bodyFont('800'), styles.overlayText]}>
                {isFlipped ? 'Дальше' : 'Перевернуть'}
              </Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Запомнил, убрать карточку"
          onPress={() => exitLeft(current.id)}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: 'rgba(31,181,116,0.12)', opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Icon name="check" size={16} color={accent.green} />
          <Text style={[bodyFont('700'), styles.actionText, { color: accent.green }]}>
            Запомнил
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFlipped ? 'Следующая карточка' : 'Перевернуть карточку'}
          onPress={() => (isFlipped ? exitRight() : triggerFlip())}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: 'rgba(46,107,255,0.12)', opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Icon name="arrow-right" size={16} color={accent.blue} />
          <Text style={[bodyFont('700'), styles.actionText, { color: accent.blue }]}>
            {isFlipped ? 'Дальше' : 'Перевернуть'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Одна и та же фиксированная коробка для лицевой/оборотной/пик-карточки —
// не тянется по ширине контейнера (иначе на широком вебе карточка
// растягивалась вместе с центрированной колонкой и переставала быть
// «одного размера» с мобильной). `maxWidth` только ограничивает сверху —
// на очень узких телефонах карточка всё ещё сжимается, чтобы не вылезать
// за экран, но выглядит одинаково на каждом развороте и на каждом устройстве.
const CARD_MAX_WIDTH = 400;
const CARD_HEIGHT = 460;

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  progressRow: { width: '100%', alignItems: 'center', gap: 9 },
  progressPill: { borderRadius: radius.xs, paddingHorizontal: 11, paddingVertical: 5 },
  progress: { fontSize: 12 },
  progressBar: { width: '60%' },
  stack: { width: '100%', height: CARD_HEIGHT },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
  },
  peekCard2: { top: 26, opacity: 0.28 },
  peekCard: {
    top: 14,
    opacity: 0.55,
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  peekText: { fontSize: 15, textAlign: 'center' },
  face: {
    position: 'absolute',
    inset: 0,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  faceBack: { borderWidth: 1 },
  faceBlob: {
    position: 'absolute',
    right: -36,
    top: -36,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(124,147,255,0.2)',
  },
  faceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faceLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: accent.gold,
    transform: [{ rotate: '45deg' }],
  },
  faceLabel: { fontSize: 12, letterSpacing: 1 },
  faceText: { fontSize: 23, lineHeight: 32, textAlign: 'center' },
  faceHint: { position: 'absolute', bottom: 20, fontSize: 11 },
  overlay: {
    position: 'absolute',
    top: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  overlayLeft: { left: 18, backgroundColor: accent.green },
  overlayRight: { right: 18, backgroundColor: accent.blue },
  overlayText: { fontSize: 12, color: '#FFFFFF' },
  actions: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch' },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: { fontSize: 13.5 },
});
