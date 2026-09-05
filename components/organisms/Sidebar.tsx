/**
 * `<Sidebar>` — постоянная desktop-навигация (Фаза 7, `docs/00-roadmap.md`).
 * Заменяет плавающий `<TabBar>` (мобильный/узкий веб паттерн) на широком
 * вебе: та же навигационная модель и те же правила гейтинга, просто другой
 * визуальный носитель — `CLAUDE.md` §9 требует не трогать бизнес-логику.
 *
 * Пункты = `TAB_ENTRIES` (hard-hide «Задачи» для Free, §6 паттерн 1) +
 * «Настройки» (на мобильном — через burger-иконку в шапке Dashboard,
 * `ROUTES.SETTINGS`, всегда доступен). Брендовый навy-фон — вне темы, как и
 * сам `<TabBar>`, чтобы сайдбар не «прыгал» цветом между light/dark-экранами
 * контента.
 */

import { Feather } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/atoms';
import { ROUTES, TAB_ENTRIES } from '@/navigation/registry';
import { selectIsPremium, useSessionStore } from '@/stores/session';
import { bodyFont, displayFont, radius, SIDEBAR_WIDTH, spacing } from '@/theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

const ICON_BY_LABEL: Record<string, FeatherIconName> = {
  Главная: 'home',
  Вузы: 'compass',
  'ИИ-ментор': 'message-circle',
  Задачи: 'check-square',
  Профиль: 'user',
};

interface Props {
  /** Скрыт вне десктопа/на роутах без сайдбара (`NO_SHELL_ROUTE_PATHS`) — не размонтируется, чтобы не сбрасывать layout-дерево вокруг `<Stack>`. */
  visible: boolean;
  activePath: string;
}

export function Sidebar({ visible, activePath }: Props) {
  const isPremium = useSessionStore(selectIsPremium);
  if (!visible) return null;

  const entries = TAB_ENTRIES.filter((e) => !e.premium || isPremium);

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.navigate(ROUTES.DASHBOARD.demoHref)}
        style={styles.brand}
      >
        <BrandLogo size={26} />
        <Text style={[displayFont('600'), styles.brandName]}>AcademicSpace</Text>
      </Pressable>

      <View style={styles.nav}>
        {entries.map((entry) => (
          <SidebarItem
            key={entry.routePath}
            label={entry.label}
            icon={ICON_BY_LABEL[entry.label] ?? 'circle'}
            active={entry.routePath === activePath}
            onPress={() => router.navigate(entry.href)}
          />
        ))}
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <SidebarItem
          label="Настройки"
          icon="settings"
          active={activePath === ROUTES.SETTINGS.path}
          onPress={() => router.push(ROUTES.SETTINGS.demoHref as Href)}
        />
      </View>
    </View>
  );
}

function SidebarItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: FeatherIconName;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.item, active && styles.itemActive]}
    >
      <Feather
        name={icon}
        size={17}
        color={active ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
        style={styles.itemIcon}
      />
      <Text style={[bodyFont('700'), styles.itemLabel, active && styles.itemLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    backgroundColor: 'rgba(15,18,48,0.98)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.sm },
  brandName: { fontSize: 15.5, color: '#FFFFFF', letterSpacing: -0.3 },
  nav: { gap: 4, marginTop: spacing.xxxl },
  spacer: { flex: 1, minHeight: spacing.xxxl },
  footer: {
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 42,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  itemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  itemIcon: { width: 18, textAlign: 'center' },
  itemLabel: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  itemLabelActive: { color: '#FFFFFF' },
});
