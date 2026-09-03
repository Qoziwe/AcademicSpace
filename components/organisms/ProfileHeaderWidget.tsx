/**
 * `<ProfileHeaderWidget>` — брендовая навy-шапка с профилем пользователя.
 * Всегда `navy.primary`, тему игнорирует (`docs/design-tokens.md`).
 *
 *  - `variant="dashboard"` (`design-reference.html:180`): аватар 82 в
 *    XP-кольце + пилюля уровня, справа карточка имени/тарифа и карточка XP.
 *  - `variant="profile"` (`:835`): верхний ряд (назад / «Настройки»),
 *    аватар 72, имя, чип уровня и три стата.
 */

import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Avatar, ProgressBar } from '@/components/atoms';
import { accent, bodyFont, displayFont, navy, radius, spacing } from '@/theme';

interface Stat {
  value: string;
  label: string;
}

interface Props {
  variant?: 'dashboard' | 'profile';
  name: string;
  planLabel: string;
  isPremium: boolean;
  level: number;
  xpCurrent: number;
  xpTarget: number;
  /** «11 класс · <тариф>» — только для `profile`. */
  grade?: string;
  /** Три стата под именем — только для `profile`. */
  stats?: Stat[];
  onAvatarPress?: () => void;
  onBack?: () => void;
  onSettings?: () => void;
  style?: StyleProp<ViewStyle>;
}

const CARD_BG = 'rgba(255,255,255,0.10)';

export function ProfileHeaderWidget({
  variant = 'dashboard',
  name,
  planLabel,
  isPremium,
  level,
  xpCurrent,
  xpTarget,
  grade,
  stats,
  onAvatarPress,
  onBack,
  onSettings,
  style,
}: Props) {
  const planColor = isPremium ? accent.gold : 'rgba(255,255,255,0.55)';
  const progress = xpTarget > 0 ? xpCurrent / xpTarget : 0;

  if (variant === 'profile') {
    return (
      <View style={[styles.root, style]}>
        {(onBack || onSettings) && (
          <View style={styles.topRow}>
            {onBack ? (
              <Pressable
                accessibilityLabel="Назад"
                hitSlop={8}
                onPress={onBack}
                style={styles.backChip}
              >
                <Feather name="chevron-left" size={16} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View />
            )}
            {onSettings ? (
              <Pressable hitSlop={8} onPress={onSettings}>
                <Text style={[bodyFont('700'), styles.settingsLink]}>Настройки</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        <View style={styles.profileRow}>
          <Avatar size={72} level={level} gapColor={navy.primary} />
          <View style={styles.profileCol}>
            <Text style={[bodyFont('800'), styles.profileName]}>{name}</Text>
            <Text style={[bodyFont('500'), styles.grade]}>{grade ?? planLabel}</Text>
            <View style={styles.levelChip}>
              <Text style={[displayFont('600'), styles.levelChipLvl]}>Уровень {level}</Text>
              <Text style={[bodyFont('500'), styles.levelChipXp]}>
                {xpCurrent} / {xpTarget} XP
              </Text>
            </View>
          </View>
        </View>

        {stats && stats.length > 0 ? (
          <View style={styles.stats}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={[displayFont('600'), styles.statValue]}>{s.value}</Text>
                <Text style={[bodyFont('500'), styles.statLabel]}>{s.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  // dashboard
  return (
    <View style={[styles.root, styles.dashRow, style]}>
      <Pressable accessibilityLabel="Профиль" disabled={!onAvatarPress} onPress={onAvatarPress}>
        <Avatar size={82} xpProgress={progress} level={level} gapColor={navy.primary} />
      </Pressable>

      <View style={styles.dashCol}>
        <View style={styles.dashCard}>
          <Text numberOfLines={1} style={[bodyFont('700'), styles.dashName]}>
            {name}
          </Text>
          <Text style={[bodyFont('600'), styles.dashPlan, { color: planColor }]}>{planLabel}</Text>
        </View>
        <View style={styles.dashCard}>
          <View style={styles.dashXpRow}>
            <Text style={[bodyFont('600'), styles.dashXpLabel]}>Опыт до {level + 1} уровня</Text>
            <Text style={[displayFont('500'), styles.dashXpValue]}>
              {xpCurrent}/{xpTarget}
            </Text>
          </View>
          <ProgressBar
            value={progress}
            height={5}
            trackColor="rgba(255,255,255,0.16)"
            fillGradient={['#7C93FF', '#B6C4FF']}
            style={styles.dashBar}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: navy.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backChip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLink: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  profileCol: { flex: 1, minWidth: 0 },
  profileName: { fontSize: 18, color: '#FFFFFF' },
  grade: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 9,
  },
  levelChipLvl: { fontSize: 11, color: '#FFFFFF' },
  levelChipXp: { fontSize: 10.5, color: 'rgba(255,255,255,0.5)' },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statValue: { fontSize: 15, color: '#FFFFFF' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  dashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: spacing.xl,
  },
  dashCol: { flex: 1, minWidth: 0, gap: spacing.sm },
  dashCard: {
    backgroundColor: CARD_BG,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dashName: { fontSize: 15.5, color: '#FFFFFF' },
  dashPlan: { fontSize: 11, marginTop: 2 },
  dashXpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  dashXpLabel: { fontSize: 10.5, color: 'rgba(255,255,255,0.55)' },
  dashXpValue: { fontSize: 11, color: '#FFFFFF' },
  dashBar: { marginTop: 7 },
});
