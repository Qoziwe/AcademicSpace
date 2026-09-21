/**
 * `<Avatar>` + `<LevelPill>` — аватар пользователя из прототипа
 * (`design-reference.html:181/836`): градиентный круг `#D7DEF6 → #AAB6E4`
 * с силуэтом `#8A93C9`, опционально в XP-кольце (`<ProgressRing>`) и с
 * пилюлей уровня внизу (`LVL 4`, `:188`).
 *
 * Реального фото пока нет — силуэт-заглушка. Когда появится загрузка
 * аватара, добавится проп `source` без изменения вызовов.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { ProgressRing } from '@/components/atoms/ProgressRing';
import { bodyFont, navy } from '@/theme';

const SILHOUETTE = '#8A93C9'; // ref: design-reference.html avatar

interface AvatarProps {
  size?: number;
  /** 0..1 — если задано, аватар оборачивается в XP-кольцо. */
  xpProgress?: number;
  /** Если задано, снизу по центру — пилюля уровня. */
  level?: number;
  /** Цвет «зазора» между кольцом и аватаром (фон экрана: навy). */
  gapColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({
  size = 72,
  xpProgress,
  level,
  gapColor = navy.primary,
  style,
}: AvatarProps) {
  const ringed = xpProgress != null;
  const inset = ringed ? 7 : 0;
  const gap = ringed ? 4 : 0;

  const face = (
    <View style={[{ width: size, height: size }, style]}>
      {gap > 0 ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { margin: gap, borderRadius: size, backgroundColor: gapColor },
          ]}
        />
      ) : null}
      <LinearGradient
        colors={['#D7DEF6', '#AAB6E4']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          StyleSheet.absoluteFillObject,
          { margin: inset, borderRadius: size, overflow: 'hidden' },
        ]}
      >
        <View style={[styles.head, { backgroundColor: SILHOUETTE }]} />
        <View style={[styles.body, { backgroundColor: SILHOUETTE }]} />
      </LinearGradient>
      {level != null ? (
        <View style={styles.pill}>
          <LevelPill level={level} borderColor={gapColor} />
        </View>
      ) : null}
    </View>
  );

  if (!ringed) return face;

  return (
    <ProgressRing progress={xpProgress ?? 0} size={size} strokeWidth={4}>
      {face}
    </ProgressRing>
  );
}

interface LevelPillProps {
  level: number;
  label?: string;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function LevelPill({ level, label, borderColor = navy.primary, style }: LevelPillProps) {
  return (
    <View style={[styles.levelPill, { borderColor }, style]}>
      <Text style={[bodyFont('800'), styles.levelText]}>{label ?? `LVL ${level}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    position: 'absolute',
    left: '33%',
    top: '20%',
    width: '34%',
    height: '34%',
    borderRadius: 999,
  },
  body: {
    position: 'absolute',
    left: '18%',
    top: '60%',
    width: '64%',
    height: '52%',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  pill: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  levelPill: {
    backgroundColor: '#7C93FF',
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  levelText: {
    fontSize: 9.5,
    color: '#12153A',
  },
});
