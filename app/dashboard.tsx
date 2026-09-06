import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo, Button, Icon, ProgressBar, type TileIconName } from '@/components/atoms';
import { BentoTile, UniversityCard } from '@/components/molecules';
import { ActiveTasksBlock, ProfileHeaderWidget } from '@/components/organisms';
import { useAchievementLog } from '@/hooks/api/useAchievements';
import { useProfile } from '@/hooks/api/useProfile';
import { useQuestionnaireStatus } from '@/hooks/api/useQuestionnaire';
import { useTasks, useToggleTaskItem } from '@/hooks/api/useTasks';
import { useUniversitySearch } from '@/hooks/api/useUniversitySearch';
import { useVaults } from '@/hooks/api/useVaults';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useTheme } from '@/hooks/useTheme';
import { BUCKET_COUNTS, type LogDotColor } from '@/mocks/fixtures';
import { ROUTES } from '@/navigation/registry';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, navy, radius, spacing } from '@/theme';

/**
 * DASHBOARD (`/dashboard`, `design-reference.html:164`). Таб-рут. Верхняя
 * навy-зона (вне темы) + нижний белый sheet (theme-aware, 7 токенов).
 * Состояние анкеты (`filled`) переключает newbie-карту ↔ карту профиля;
 * роль (Free/Premium) — блок задач и апселл.
 *
 * Две раскладки, обе на одних и тех же хуках/данных (`CLAUDE.md` §9):
 *  - `DesktopDashboard` (Фаза 7) — многоколоночная desktop-страница;
 *  - `MobileDashboard` (в т. ч. мобильный веб) — sheet не в потоке: лежит
 *    абсолютным слоем поверх navy-зоны (фикс. высота экрана, `100vh` на
 *    вебе) и тянется жестом (Reanimated + Gesture Handler) за любую точку
 *    секции (не только `grab`-хендл) между collapsed (высота navy-контента,
 *    измеряется `onLayout`) и expanded (под safe-area top), закрывая шапку
 *    целиком. Внутри секции сознательно нет отдельного скролла — единственный
 *    жест это сам драг шторки, чтобы не конкурировать с нативным тач-скроллом
 *    браузера (было — см. историю коммитов фикса драга).
 */

const DOT_COLOR: Record<LogDotColor, string> = {
  blue: accent.blue,
  blueLight: accent.blueLight,
  green: accent.green,
  gold: accent.gold,
  rose: accent.rose,
};

const TILES: { label: string; icon: TileIconName; href: Href; premium: boolean }[] = [
  { label: 'Профиль', icon: 'profile', href: ROUTES.PROFILE.demoHref, premium: false },
  { label: 'Копилка', icon: 'vault', href: ROUTES.VAULTS_LIST.demoHref, premium: true },
  { label: 'Вузы', icon: 'universities', href: ROUTES.RESULTS.demoHref, premium: false },
  { label: 'Анкета', icon: 'questionnaire', href: ROUTES.QUESTIONNAIRE.demoHref, premium: false },
  { label: 'Журнал', icon: 'journal', href: ROUTES.ACHIEVEMENT_LOG.demoHref, premium: false },
  { label: 'Фокус', icon: 'focus', href: ROUTES.FOCUS_TOOLS.demoHref, premium: true },
  { label: 'Задачи', icon: 'tasks', href: ROUTES.ACTIVE_TASKS.demoHref, premium: true },
  { label: 'ИИ-ментор', icon: 'mentor', href: ROUTES.AI_CHAT.demoHref, premium: true },
];

function DashboardScreen() {
  const { isDesktop } = useBreakpoint();
  if (isDesktop) return <DesktopDashboard />;
  return <MobileDashboard />;
}

/**
 * Desktop (Фаза 7): жест-шторка мобильного паттерна тут не нужен (нет
 * тач-драга) — та же данные (`useProfile`/`useQuestionnaireStatus`/
 * `useTasks`) и те же карточки (`NewbieCard`/`EditProfileCard`/
 * `ActiveTasksBlock`/`UpsellCard`), но обычная двухколоночная страница:
 * слева быстрый доступ + зона анализа, справа профиль-виджет + задачи/апселл.
 */
function DesktopDashboard() {
  const { palette } = useTheme();
  const profileQ = useProfile();
  const questionnaireQ = useQuestionnaireStatus();
  const tasksQ = useTasks();
  const toggleItem = useToggleTaskItem();
  const searchQ = useUniversitySearch();
  const vaultsQ = useVaults();
  const achievementLogQ = useAchievementLog();

  const profile = profileQ.data;
  const filled = questionnaireQ.data?.filled ?? false;
  const isPremium = profile?.plan === 'premium';

  const topUniversities =
    searchQ.data?.groups
      .flatMap((g) => g.items.map((it) => ({ ...it, category: g.category })))
      .slice(0, 3) ?? [];
  const previewVaults = vaultsQ.data?.slice(0, 3) ?? [];
  const recentAchievements = (achievementLogQ.data?.days.flatMap((d) => d.items) ?? []).slice(0, 4);

  const goAnalysis = () =>
    router.push(filled ? '/universities/results' : '/universities/questionnaire');

  return (
    <View style={[styles.desktopRoot, { backgroundColor: palette.screen }]}>
      <View style={styles.desktopHeader}>
        <Text style={[displayFont('700'), styles.desktopTitle, { color: palette.ink }]}>
          Дашборд
        </Text>
        <Text style={[bodyFont('500'), styles.desktopSubtitle, { color: palette.sub }]}>
          Обзор подбора вузов, задач и прогресса
        </Text>
      </View>

      <View style={styles.desktopGrid}>
        <View style={styles.desktopMain}>
          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[bodyFont('800'), styles.cardHeading, { color: palette.ink }]}>
              Быстрый доступ
            </Text>
            <View style={styles.desktopTiles}>
              {TILES.map((t) => (
                <View key={t.label} style={styles.desktopTileCell}>
                  <BentoTile label={t.label} icon={t.icon} href={t.href} premium={t.premium} />
                </View>
              ))}
            </View>
          </View>

          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.analysisHead}>
              <View style={styles.analysisHeadText}>
                <Text style={[bodyFont('800'), styles.analysisTitle, { color: palette.ink }]}>
                  Зона анализа
                </Text>
                <Text style={[bodyFont('500'), styles.analysisSub, { color: palette.sub }]}>
                  {filled && profile
                    ? `${profile.analysis.country} · подбор от ${profile.analysis.sinceLabel}`
                    : 'заполните анкету, чтобы запустить'}
                </Text>
              </View>
              <Button
                label={filled ? 'Показать вузы' : 'Запустить подбор'}
                tone="blue"
                size="sm"
                block={false}
                elevated
                onPress={goAnalysis}
              />
            </View>
            <View style={styles.buckets}>
              {(
                [
                  ['Безопасные', accent.green, BUCKET_COUNTS.safety],
                  ['Оптимальные', accent.blue, BUCKET_COUNTS.match],
                  ['Амбициозные', accent.rose, BUCKET_COUNTS.reach],
                ] as const
              ).map(([label, color, n]) => (
                <Pressable
                  key={label}
                  onPress={goAnalysis}
                  style={[styles.bucket, { backgroundColor: palette.chip }]}
                >
                  <Text style={[displayFont('600'), styles.bucketN, { color }]}>
                    {filled ? String(n) : '—'}
                  </Text>
                  <Text style={[bodyFont('600'), styles.bucketLabel, { color: palette.sub }]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {filled && topUniversities.length > 0 ? (
            <View
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.cardHeadRow}>
                <Text style={[bodyFont('800'), styles.cardHeadingRow, { color: palette.ink }]}>
                  Топ вузов подборки
                </Text>
                <Pressable onPress={() => router.push('/universities/results')} hitSlop={8}>
                  <Text style={[bodyFont('700'), styles.cardLink]}>Показать все</Text>
                </Pressable>
              </View>
              <View style={styles.desktopUniGrid}>
                {topUniversities.map((u) => (
                  <UniversityCard
                    key={u.id}
                    name={u.name}
                    city={u.city}
                    chance={u.chance}
                    category={u.category}
                    tags={u.tags}
                    onPress={() =>
                      router.push({ pathname: '/universities/[id]', params: { id: u.id } })
                    }
                    style={styles.desktopUniCard}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {isPremium && previewVaults.length > 0 ? (
            <View
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.cardHeadRow}>
                <Text style={[bodyFont('800'), styles.cardHeadingRow, { color: palette.ink }]}>
                  Копилки документов
                </Text>
                <Pressable onPress={() => router.push('/documents')} hitSlop={8}>
                  <Text style={[bodyFont('700'), styles.cardLink]}>Все копилки</Text>
                </Pressable>
              </View>
              <View style={styles.vaultsPreview}>
                {previewVaults.map((v) => (
                  <Pressable
                    key={v.id}
                    onPress={() =>
                      router.push({ pathname: '/documents/[vaultId]', params: { vaultId: v.id } })
                    }
                    style={[styles.vaultRow, { borderColor: palette.border }]}
                  >
                    <View style={styles.vaultRowText}>
                      <Text style={[bodyFont('700'), styles.vaultName, { color: palette.ink }]}>
                        {v.universityName}
                      </Text>
                      <Text style={[bodyFont('500'), styles.vaultDeadline, { color: palette.sub }]}>
                        {v.deadline}
                      </Text>
                    </View>
                    <ProgressBar
                      value={v.cellsTotal > 0 ? v.filled / v.cellsTotal : 0}
                      height={5}
                      trackColor={palette.border}
                      style={styles.vaultBar}
                    />
                    <Text style={[bodyFont('700'), styles.vaultCount, { color: accent.blue }]}>
                      {v.filled}/{v.cellsTotal}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {recentAchievements.length > 0 ? (
            <View
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.cardHeadRow}>
                <Text style={[bodyFont('800'), styles.cardHeadingRow, { color: palette.ink }]}>
                  Последние достижения
                </Text>
                <Pressable onPress={() => router.push('/profile/history')} hitSlop={8}>
                  <Text style={[bodyFont('700'), styles.cardLink]}>Весь журнал</Text>
                </Pressable>
              </View>
              <View style={styles.achievements}>
                {recentAchievements.map((a, i) => (
                  <View
                    key={`${a.title}:${i}`}
                    style={[styles.achievementRow, { borderColor: palette.border }]}
                  >
                    <View style={[styles.achievementDot, { backgroundColor: DOT_COLOR[a.dot] }]} />
                    <View style={styles.achievementText}>
                      <Text
                        style={[bodyFont('700'), styles.achievementTitle, { color: palette.ink }]}
                      >
                        {a.title}
                      </Text>
                      <Text
                        style={[bodyFont('500'), styles.achievementKind, { color: palette.sub }]}
                      >
                        {a.kind}
                      </Text>
                    </View>
                    <Text style={[bodyFont('800'), styles.achievementXp]}>+{a.xp} XP</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.desktopSide}>
          {profile ? (
            <ProfileHeaderWidget
              variant="dashboard"
              name={profile.name}
              planLabel={
                isPremium
                  ? `Premium · до ${profile.subscription?.renewsAt ?? '—'}`
                  : 'Базовый доступ'
              }
              isPremium={isPremium}
              level={profile.level}
              xpCurrent={profile.xp}
              xpTarget={profile.xpToNextLevel}
              onAvatarPress={() => router.push('/profile')}
              style={styles.desktopProfileWidget}
            />
          ) : (
            <View style={styles.widgetLoading}>
              <ActivityIndicator color={accent.blue} />
            </View>
          )}

          {!filled ? (
            <NewbieCard onStart={() => router.push('/universities/questionnaire')} />
          ) : (
            <EditProfileCard
              stats={profile?.dashboardStats ?? []}
              onEdit={() => router.push('/universities/questionnaire')}
            />
          )}

          {isPremium && tasksQ.data ? (
            <ActiveTasksBlock
              tasks={tasksQ.data.map((t) => ({
                id: t.id,
                kind: t.kind,
                title: t.title,
                items: t.items.map((it, i) => ({
                  id: `${t.id}:${i}`,
                  label: it.label,
                  done: it.done,
                })),
              }))}
              onToggleItem={(taskId, itemId) =>
                toggleItem.mutate({ taskId, itemIndex: Number(itemId.split(':')[1]) })
              }
              onOpenTask={(taskId) =>
                router.push({ pathname: '/tasks/[moduleId]', params: { moduleId: taskId } })
              }
              onSeeAll={() => router.push('/tasks')}
            />
          ) : null}

          {!isPremium ? <UpsellCard onCreate={() => router.push('/ai/portfolio')} /> : null}
        </View>
      </View>
    </View>
  );
}

function MobileDashboard() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const profileQ = useProfile();
  const questionnaireQ = useQuestionnaireStatus();
  const tasksQ = useTasks();
  const toggleItem = useToggleTaskItem();

  const profile = profileQ.data;
  const filled = questionnaireQ.data?.filled ?? false;
  const isPremium = profile?.plan === 'premium';

  const goAnalysis = () =>
    router.push(filled ? '/universities/results' : '/universities/questionnaire');

  const expandedY = insets.top + 8;
  const [sheetReady, setSheetReady] = useState(false);
  const collapsedY = useSharedValue(0);
  const translateY = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const isExpanded = useSharedValue(false);

  const onTopContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    collapsedY.value = h;
    if (!isExpanded.value) {
      translateY.value = h;
    }
    setSheetReady(true);
  };

  // Внутри секции нет отдельного скролла — единственный жест это драг
  // (в любой точке секции, не только по grab-хендлу), который двигает
  // саму шторку между collapsed/expanded. Без конкурирующего скролла
  // внутри — работает одинаково на native и на вебе.
  const dragSheet = Gesture.Pan()
    .onStart(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = dragStartY.value + e.translationY;
      translateY.value = Math.min(collapsedY.value, Math.max(expandedY, next));
    })
    .onEnd((e) => {
      const mid = (collapsedY.value + expandedY) / 2;
      let expand: boolean;
      if (e.velocityY < -300) expand = true;
      else if (e.velocityY > 300) expand = false;
      else expand = translateY.value < mid;

      translateY.value = withSpring(expand ? expandedY : collapsedY.value, {
        damping: 22,
        stiffness: 220,
        mass: 0.5,
      });
      isExpanded.value = expand;
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: navy.primary }]}>
      <View onLayout={onTopContentLayout}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.brand}>
            <BrandLogo size={24} />
            <Text style={[displayFont('600'), styles.brandName]}>AcademicSpace</Text>
          </View>
          <Pressable
            accessibilityLabel="Настройки"
            onPress={() => router.push('/settings')}
            style={styles.burger}
          >
            <Icon name="menu" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {profile ? (
          <ProfileHeaderWidget
            variant="dashboard"
            name={profile.name}
            planLabel={
              isPremium ? `Premium · до ${profile.subscription?.renewsAt ?? '—'}` : 'Базовый доступ'
            }
            isPremium={isPremium}
            level={profile.level}
            xpCurrent={profile.xp}
            xpTarget={profile.xpToNextLevel}
            onAvatarPress={() => router.push('/profile')}
            style={styles.widget}
          />
        ) : (
          <View style={styles.widgetLoading}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        <View style={styles.tiles}>
          {TILES.map((t) => (
            <View key={t.label} style={styles.tileCell}>
              <BentoTile label={t.label} icon={t.icon} href={t.href} premium={t.premium} />
            </View>
          ))}
        </View>
      </View>

      <GestureDetector gesture={dragSheet}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: palette.screen, opacity: sheetReady ? 1 : 0 },
            sheetAnimatedStyle,
          ]}
        >
          <View style={styles.grabWrap}>
            <View style={styles.grab} />
          </View>
          <View style={[styles.sheetContent, { paddingBottom: insets.bottom + 120 }]}>
            {!filled ? (
              <NewbieCard onStart={() => router.push('/universities/questionnaire')} />
            ) : (
              <EditProfileCard
                stats={profile?.dashboardStats ?? []}
                onEdit={() => router.push('/universities/questionnaire')}
              />
            )}

            {isPremium && tasksQ.data ? (
              <ActiveTasksBlock
                tasks={tasksQ.data.map((t) => ({
                  id: t.id,
                  kind: t.kind,
                  title: t.title,
                  items: t.items.map((it, i) => ({
                    id: `${t.id}:${i}`,
                    label: it.label,
                    done: it.done,
                  })),
                }))}
                onToggleItem={(taskId, itemId) =>
                  toggleItem.mutate({ taskId, itemIndex: Number(itemId.split(':')[1]) })
                }
                onOpenTask={(taskId) =>
                  router.push({ pathname: '/tasks/[moduleId]', params: { moduleId: taskId } })
                }
                onSeeAll={() => router.push('/tasks')}
              />
            ) : null}

            <View
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.analysisHead}>
                <View style={styles.analysisHeadText}>
                  <Text style={[bodyFont('800'), styles.analysisTitle, { color: palette.ink }]}>
                    Зона анализа
                  </Text>
                  <Text style={[bodyFont('500'), styles.analysisSub, { color: palette.sub }]}>
                    {filled && profile
                      ? `${profile.analysis.country} · подбор от ${profile.analysis.sinceLabel}`
                      : 'заполните анкету, чтобы запустить'}
                  </Text>
                </View>
                <Button
                  label={filled ? 'Показать вузы' : 'Запустить подбор'}
                  tone="blue"
                  size="sm"
                  block={false}
                  elevated
                  onPress={goAnalysis}
                />
              </View>
              <View style={styles.buckets}>
                {(
                  [
                    ['Безопасные', accent.green, BUCKET_COUNTS.safety],
                    ['Оптимальные', accent.blue, BUCKET_COUNTS.match],
                    ['Амбициозные', accent.rose, BUCKET_COUNTS.reach],
                  ] as const
                ).map(([label, color, n]) => (
                  <Pressable
                    key={label}
                    onPress={goAnalysis}
                    style={[styles.bucket, { backgroundColor: palette.chip }]}
                  >
                    <Text style={[displayFont('600'), styles.bucketN, { color }]}>
                      {filled ? String(n) : '—'}
                    </Text>
                    <Text style={[bodyFont('600'), styles.bucketLabel, { color: palette.sub }]}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {!isPremium ? <UpsellCard onCreate={() => router.push('/ai/portfolio')} /> : null}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function NewbieCard({ onStart }: { onStart: () => void }) {
  return (
    <LinearGradient
      colors={['#3A41A0', navy.primary]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.promo}
    >
      <View style={styles.promoBlob} />
      <Text style={[bodyFont('800'), styles.promoTitle]}>
        Заполните профиль и откройте свои перспективы
      </Text>
      <Text style={[bodyFont('400'), styles.promoText]}>
        Анкета — 12 полей об оценках, экзаменах и интересах. На их основе алгоритм скоринга
        посчитает ваш рейтинг и подберёт вузы.
      </Text>
      <Button
        label="Заполнить анкету"
        tone="contrast"
        size="md"
        onPress={onStart}
        iconRight={<Icon name="arrow-right" size={15} color="#1B1F4B" />}
        style={styles.promoBtn}
      />
    </LinearGradient>
  );
}

function EditProfileCard({
  stats,
  onEdit,
}: {
  stats: { v: string; k: string }[];
  onEdit: () => void;
}) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Button label="Редактировать профиль" tone="navy" onPress={onEdit} />
      <Text style={[bodyFont('500'), styles.editText, { color: palette.sub }]}>
        Ваши цели меняются? Убедитесь, что данные актуальны, чтобы подборка была максимально точной.
      </Text>
      {stats.length > 0 ? (
        <View style={[styles.stats, { borderTopColor: palette.border }]}>
          {stats.map((s) => (
            <View key={s.k}>
              <Text style={[displayFont('600'), styles.statNum, { color: palette.ink }]}>
                {s.v}
              </Text>
              <Text style={[bodyFont('500'), styles.statLabel, { color: palette.sub }]}>{s.k}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function UpsellCard({ onCreate }: { onCreate: () => void }) {
  return (
    <LinearGradient
      colors={[navy.deep, '#2A2F73']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.promo}
    >
      <View style={[styles.promoBlob, styles.promoBlobGold]} />
      <View style={styles.premiumTag}>
        <View style={styles.premiumDot} />
        <Text style={[bodyFont('800'), styles.premiumTagText]}>PREMIUM</Text>
      </View>
      <Text style={[bodyFont('800'), styles.promoTitleSm]}>
        Базовый подбор готов. Хотите большего?
      </Text>
      <Text style={[bodyFont('400'), styles.promoText]}>
        Загрузите резюме и мотивационные письма — ИИ составит персональную стратегию поступления в
        топовые вузы.
      </Text>
      <Button
        label="Создать ИИ-портфолио"
        tone="gold"
        size="md"
        onPress={onCreate}
        style={styles.promoBtn}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandName: { fontSize: 15, color: '#FFFFFF', letterSpacing: -0.3 },
  burger: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widget: { paddingTop: 18, paddingBottom: 0, paddingHorizontal: spacing.xl },
  widgetLoading: { paddingVertical: 40, alignItems: 'center' },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  tileCell: { width: '22%', flexGrow: 1 },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: 10,
    shadowColor: 'rgba(10,13,40,1)',
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  grabWrap: { alignItems: 'center', paddingVertical: 10 },
  grab: { width: 56, height: 5, borderRadius: 3, backgroundColor: '#D3D7E6' },
  sheetContent: { paddingHorizontal: 18, paddingTop: 8, gap: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 18 },
  analysisHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  analysisHeadText: { flex: 1, minWidth: 0 },
  analysisTitle: { fontSize: 14 },
  analysisSub: { fontSize: 11.5, marginTop: 3 },
  buckets: { flexDirection: 'row', gap: 8, marginTop: 15 },
  bucket: { flex: 1, borderRadius: radius.md, padding: 12 },
  bucketN: { fontSize: 17 },
  bucketLabel: { fontSize: 10.5, marginTop: 3 },
  editText: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  stats: { flexDirection: 'row', gap: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  statNum: { fontSize: 15 },
  statLabel: { fontSize: 10.5, marginTop: 2 },
  promo: { borderRadius: radius.xl, padding: 20, overflow: 'hidden' },
  promoBlob: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124,147,255,0.22)',
  },
  promoBlobGold: {
    right: undefined,
    top: undefined,
    left: -20,
    bottom: -40,
    backgroundColor: 'rgba(243,194,75,0.14)',
  },
  promoTitle: { fontSize: 18, lineHeight: 22.5, color: '#FFFFFF', letterSpacing: -0.3 },
  promoTitleSm: { fontSize: 16, lineHeight: 21, color: '#FFFFFF', marginTop: 11 },
  promoText: { fontSize: 12, lineHeight: 18.5, color: 'rgba(255,255,255,0.62)', marginTop: 9 },
  promoBtn: { marginTop: 16 },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(243,194,75,0.16)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  premiumDot: { width: 5, height: 5, borderRadius: 1, backgroundColor: accent.gold },
  premiumTagText: { fontSize: 10, color: accent.gold, letterSpacing: 0.6 },
  // Desktop (Фаза 7) — двухколоночная раскладка, без навy full-bleed/шторки.
  desktopRoot: { flex: 1, padding: spacing.xxxl, gap: spacing.xxl },
  desktopHeader: { gap: 4 },
  desktopTitle: { fontSize: 24, letterSpacing: -0.4 },
  desktopSubtitle: { fontSize: 13 },
  desktopGrid: { flexDirection: 'row', gap: spacing.xxl, alignItems: 'flex-start' },
  desktopMain: { flex: 2, minWidth: 0, gap: spacing.xl },
  desktopSide: { flex: 1, minWidth: 320, gap: spacing.lg },
  cardHeading: { fontSize: 13, marginBottom: spacing.lg },
  desktopTiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  desktopTileCell: { width: 140 },
  desktopProfileWidget: { borderRadius: radius.xl, overflow: 'hidden' },
  cardHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardHeadingRow: { fontSize: 13 },
  cardLink: { fontSize: 11.5, color: accent.blue },
  desktopUniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  desktopUniCard: { flexGrow: 1, flexBasis: 220, maxWidth: 320 },
  vaultsPreview: { gap: spacing.md },
  vaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
  },
  vaultRowText: { width: 160, minWidth: 0 },
  vaultName: { fontSize: 12.5 },
  vaultDeadline: { fontSize: 10.5, marginTop: 2 },
  vaultBar: { flex: 1 },
  vaultCount: { fontSize: 11.5, width: 40, textAlign: 'right' },
  achievements: { gap: spacing.md },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
  },
  achievementDot: { width: 8, height: 8, borderRadius: 3, flexShrink: 0 },
  achievementText: { flex: 1, minWidth: 0 },
  achievementTitle: { fontSize: 12.5 },
  achievementKind: { fontSize: 10.5, marginTop: 2 },
  achievementXp: { fontSize: 11, color: accent.green, flexShrink: 0 },
});

export default withGuard(DashboardScreen, { auth: true });
