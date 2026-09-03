import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo, Button } from '@/components/atoms';
import { BentoTile } from '@/components/molecules';
import { ActiveTasksBlock, ProfileHeaderWidget } from '@/components/organisms';
import { useProfile } from '@/hooks/api/useProfile';
import { useQuestionnaireStatus } from '@/hooks/api/useQuestionnaire';
import { useTasks, useToggleTaskItem } from '@/hooks/api/useTasks';
import { useTheme } from '@/hooks/useTheme';
import { BUCKET_COUNTS } from '@/mocks/fixtures';
import { ROUTES } from '@/navigation/registry';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, navy, radius, spacing } from '@/theme';

/**
 * DASHBOARD (`/dashboard`, `design-reference.html:164`). Таб-рут. Верхняя
 * навy-зона (вне темы) + нижний белый sheet (theme-aware, 7 токенов).
 * Состояние анкеты (`filled`) переключает newbie-карту ↔ карту профиля;
 * роль (Free/Premium) — блок задач и апселл.
 */

const TILES = [
  { label: 'Профиль', glyph: '◉', href: ROUTES.PROFILE.demoHref, premium: false, bot: false },
  { label: 'Копилка', glyph: '▤', href: ROUTES.VAULTS_LIST.demoHref, premium: true, bot: false },
  { label: 'Вузы', glyph: '◎', href: ROUTES.RESULTS.demoHref, premium: false, bot: false },
  { label: 'Анкета', glyph: '▦', href: ROUTES.QUESTIONNAIRE.demoHref, premium: false, bot: false },
  {
    label: 'Журнал',
    glyph: '≡',
    href: ROUTES.ACHIEVEMENT_LOG.demoHref,
    premium: false,
    bot: false,
  },
  { label: 'Фокус', glyph: '∿', href: ROUTES.FOCUS_TOOLS.demoHref, premium: true, bot: false },
  { label: 'Задачи', glyph: '✓', href: ROUTES.ACTIVE_TASKS.demoHref, premium: true, bot: false },
  { label: 'ИИ-ментор', glyph: '●●', href: ROUTES.AI_CHAT.demoHref, premium: true, bot: true },
];

function DashboardScreen() {
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

  return (
    <View style={[styles.root, { backgroundColor: navy.primary }]}>
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
          <Feather name="menu" size={18} color="#FFFFFF" />
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
            <BentoTile
              label={t.label}
              glyph={t.glyph}
              href={t.href}
              premium={t.premium}
              variant={t.bot ? 'bot' : 'default'}
            />
          </View>
        ))}
      </View>

      <View style={[styles.sheet, { backgroundColor: palette.screen }]}>
        <View style={styles.grabWrap}>
          <View style={styles.grab} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {!filled ? (
            <NewbieCard onStart={() => router.push('/universities/questionnaire')} />
          ) : (
            <EditProfileCard onEdit={() => router.push('/universities/questionnaire')} />
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
                  {filled ? 'Италия · подбор от 14 марта' : 'заполните анкету, чтобы запустить'}
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
        </ScrollView>
      </View>
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
        iconRight={<Feather name="arrow-right" size={14} color="#1B1F4B" />}
        style={styles.promoBtn}
      />
    </LinearGradient>
  );
}

function EditProfileCard({ onEdit }: { onEdit: () => void }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Button label="Редактировать профиль" tone="navy" onPress={onEdit} />
      <Text style={[bodyFont('500'), styles.editText, { color: palette.sub }]}>
        Ваши цели меняются? Убедитесь, что данные актуальны, чтобы подборка была максимально точной.
      </Text>
      <View style={[styles.stats, { borderTopColor: palette.border }]}>
        {(
          [
            ['78', 'рейтинг'],
            ['12/12', 'полей'],
            ['Италия', 'страна подбора'],
          ] as const
        ).map(([v, k]) => (
          <View key={k}>
            <Text style={[displayFont('600'), styles.statNum, { color: palette.ink }]}>{v}</Text>
            <Text style={[bodyFont('500'), styles.statLabel, { color: palette.sub }]}>{k}</Text>
          </View>
        ))}
      </View>
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
    flex: 1,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: 10,
    shadowColor: 'rgba(10,13,40,1)',
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  grabWrap: { alignItems: 'center', paddingBottom: 6 },
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
});

export default withGuard(DashboardScreen, { auth: true });
