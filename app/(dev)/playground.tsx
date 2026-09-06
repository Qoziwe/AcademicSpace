/**
 * Playground — dev-only витрина UI-кита Фазы 2 (аналог левой панели
 * прототипа). Не в реестре роутов, доступен только при `__DEV__` (гард в
 * `app/(dev)/_layout.tsx`). Нужен для визуальной сверки атомов/молекул/
 * организмов без прохода по всему флоу.
 *
 * Липкая панель сверху: Premium (session store) / Filled (локально) /
 * Тема (theme store).
 */

import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  Badge,
  BrandLogo,
  Button,
  Checkbox,
  Chip,
  Divider,
  Icon,
  IconTile,
  LevelPill,
  ProgressBar,
  ProgressRing,
  Switch,
  TextField,
  type TileIconName,
} from '@/components/atoms';
import { BrandLoading } from '@/components/BrandLoading';
import {
  BentoTile,
  ChatBubble,
  DocumentCell,
  FilterOptionRow,
  FocusSoundTile,
  ModuleConfirmationCard,
  PlanCard,
  SettingsRow,
  TaskModuleCard,
  UniversityCard,
  type TaskModuleItem,
} from '@/components/molecules';
import {
  ActiveTasksBlock,
  ChatThread,
  Composer,
  FilterStepper,
  HeaderBar,
  ProfileHeaderWidget,
  ResultsGroupedList,
  SystemScreenLayout,
  TabBar,
  type ChatMessage,
} from '@/components/organisms';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/navigation/registry';
import { useSessionStore } from '@/stores/session';
import { accent, bodyFont, displayFont, navy, radius, spacing } from '@/theme';

const TILE_ICONS: Record<string, TileIconName> = {
  person: 'profile',
  doc: 'vault',
  target: 'universities',
  cal: 'questionnaire',
  list: 'journal',
  wave: 'focus',
  check: 'tasks',
  bot: 'mentor',
};

const TASK_ITEMS: TaskModuleItem[] = [
  { id: 'i1', label: 'Пробный тест Listening', done: true },
  { id: 'i2', label: '20 слов академической лексики', done: false },
  { id: 'i3', label: 'Разбор Writing Task 2', done: false },
];

const CHAT_SEED: ChatMessage[] = [
  {
    id: 'm1',
    fromMe: false,
    text: 'Ваша стратегия готова. Основной разрыв — язык: IELTS 6.5 открывает 9 из 14 программ.',
  },
  { id: 'm2', fromMe: true, text: 'Давай, и ещё про мотивационное письмо' },
  {
    id: 'm3',
    fromMe: false,
    text: 'Оформлю подготовку к IELTS дорожной картой, а письмо — чек-листом.',
    module: {
      title: 'Дорожная карта: IELTS 6.5',
      sub: '8 недель · 6 этапов',
      desc: 'Модуль появится в блоке «Активные задачи». Отмечать пункты можно не заходя в чат.',
      created: false,
    },
  },
];

export default function Playground() {
  const insets = useSafeAreaInsets();
  const { palette, isDark, toggle: toggleTheme } = useTheme();
  const plan = useSessionStore((s) => s.plan);
  const setPlan = useSessionStore((s) => s.setPlan);
  const isPremium = plan === 'premium';

  const [filled, setFilled] = useState(false);

  // локальный интерактив атомов/молекул
  const [switchOn, setSwitchOn] = useState(true);
  const [checkOn, setCheckOn] = useState(false);
  const [chips, setChips] = useState<string[]>(['Инженерия']);
  const [filterPick, setFilterPick] = useState('Италия');
  const [planPick, setPlanPick] = useState<'week' | 'month'>('month');
  const [field, setField] = useState('Тінатін Батыркызы');
  const [sound, setSound] = useState<number | null>(1);
  const [docFilled, setDocFilled] = useState(true);
  const [items, setItems] = useState(TASK_ITEMS);
  const [chat, setChat] = useState(CHAT_SEED);
  const [typing, setTyping] = useState(false);

  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const createModule = (id: string) =>
    setChat((prev) =>
      prev.map((m) =>
        m.id === id && m.module ? { ...m, module: { ...m.module, created: true } } : m,
      ),
    );

  const sendChat = (text: string) => {
    setChat((prev) => [...prev, { id: `me-${Date.now()}`, fromMe: true, text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setChat((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, fromMe: false, text: 'Записал. Разберу по шагам.' },
      ]);
    }, 1200);
  };

  const tiles = useMemo(
    () =>
      [
        ['Профиль', 'person', ROUTES.PROFILE.demoHref, false, false],
        ['Копилка', 'doc', ROUTES.VAULTS_LIST.demoHref, true, false],
        ['Вузы', 'target', ROUTES.RESULTS.demoHref, false, false],
        ['Анкета', 'cal', ROUTES.QUESTIONNAIRE.demoHref, false, false],
        ['Журнал', 'list', ROUTES.ACHIEVEMENT_LOG.demoHref, false, false],
        ['Фокус', 'wave', ROUTES.FOCUS_TOOLS.demoHref, true, false],
        ['Задачи', 'check', ROUTES.ACTIVE_TASKS.demoHref, true, false],
        ['ИИ-ментор', 'bot', ROUTES.AI_CHAT.demoHref, true, true],
      ] as const,
    [],
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.page }]}>
      {/* липкая панель тумблеров */}
      <View
        style={[
          styles.toolbar,
          {
            backgroundColor: palette.card,
            borderBottomColor: palette.border,
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Text style={[displayFont('600'), styles.toolbarTitle, { color: palette.ink }]}>
          UI-кит · Playground
        </Text>
        <View style={styles.toggles}>
          <Toggle
            label="Premium"
            value={isPremium}
            onChange={(v) => setPlan(v ? 'premium' : 'free')}
          />
          <Toggle label="Filled" value={filled} onChange={setFilled} />
          <Toggle label="Тёмная" value={isDark} onChange={toggleTheme} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 64 }]}>
        {/* ─── ATOMS ─── */}
        <Section title="Атомы · BrandLogo">
          <View style={styles.rowWrap}>
            <BrandLogo size={24} />
            <BrandLogo size={40} />
            <BrandLogo size={48} />
          </View>
        </Section>

        <Section title="Атомы · Button">
          <View style={styles.stack}>
            <Button label="Primary · navy" onPress={() => undefined} />
            <Button label="Primary · blue" tone="blue" onPress={() => undefined} />
            <Button label="Primary · gold" tone="gold" elevated onPress={() => undefined} />
            <Button label="Secondary" variant="secondary" size="md" onPress={() => undefined} />
            <Button
              label="Ghost"
              variant="ghost"
              size="md"
              onPress={() => undefined}
              iconRight={<Icon name="arrow-right" size={15} color={accent.blue} />}
            />
            <Button label="Loading" loading onPress={() => undefined} />
            <Button label="Disabled" disabled onPress={() => undefined} />
          </View>
        </Section>

        <Section title="Атомы · Chip / Badge">
          <View style={styles.rowWrap}>
            {['Инженерия', 'Технологии', 'Экономика', 'Дизайн'].map((c) => (
              <Chip
                key={c}
                label={c}
                selected={chips.includes(c)}
                onPress={() =>
                  setChips((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))
                }
              />
            ))}
          </View>
          <View style={styles.rowWrap}>
            <Badge label="PREMIUM" tone="gold" dot />
            <Badge label="MATCH" tone="onNavy" dot />
            <Badge label="SAFETY" tone="green" />
            <Badge label="REACH" tone="rose" />
            <Badge label="СИСТЕМА" tone="neutral" size="sm" />
          </View>
        </Section>

        <Section title="Атомы · Switch / Checkbox">
          <View style={styles.rowWrap}>
            <Switch value={switchOn} onValueChange={setSwitchOn} />
            <Switch value={!switchOn} onValueChange={(v) => setSwitchOn(!v)} />
            <Switch value disabled onValueChange={() => undefined} />
            <Checkbox checked={checkOn} onChange={setCheckOn} />
            <Checkbox checked={!checkOn} onChange={(v) => setCheckOn(!v)} />
            <Checkbox checked disabled />
          </View>
        </Section>

        <Section title="Атомы · ProgressRing / ProgressBar">
          <View style={styles.rowWrap}>
            <View style={[styles.ringStage, { backgroundColor: navy.primary }]}>
              <ProgressRing progress={0.62} size={72}>
                <Text style={[displayFont('600'), { color: '#fff', fontSize: 13 }]}>62%</Text>
              </ProgressRing>
            </View>
            <View style={[styles.ringStage, { backgroundColor: navy.primary }]}>
              <Avatar size={72} xpProgress={0.4} level={4} />
            </View>
          </View>
          <ProgressBar value={0.62} />
          <ProgressBar value={0.3} fillColor={accent.green} height={4} />
          <ProgressBar
            value={0.8}
            height={6}
            trackColor="rgba(27,31,75,0.12)"
            fillGradient={['#7C93FF', '#B6C4FF']}
          />
        </Section>

        <Section title="Атомы · Avatar + LevelPill">
          <View style={[styles.ringStage, { backgroundColor: navy.primary, alignSelf: 'stretch' }]}>
            <View style={styles.rowWrap}>
              <Avatar size={82} xpProgress={0.62} level={4} />
              <Avatar size={56} level={7} />
              <Avatar size={44} />
              <LevelPill level={12} />
            </View>
          </View>
        </Section>

        <Section title="Атомы · IconTile / Divider">
          <View style={styles.rowWrap}>
            <IconTile tone="blueSoft">
              <Icon name="file" size={17} color={accent.blue} />
            </IconTile>
            <IconTile tone="muted">
              <Icon name="file" size={17} color={palette.sub} />
            </IconTile>
            <IconTile tone="navy" glyph="●●" glyphSize={9} />
            <IconTile tone="navySoft" glyph="◎" />
          </View>
          <Divider spacing={spacing.sm} />
          <Text style={[bodyFont('500'), { color: palette.sub, fontSize: 12 }]}>
            под разделителем
          </Text>
        </Section>

        <Section title="Атомы · TextField">
          <View style={styles.stack}>
            <TextField label="Имя и фамилия" value={field} onChangeText={setField} />
            <TextField label="E-mail" value="tinatin@mail.kz" readOnly />
            <TextField
              label="Пароль"
              value="secret123"
              onChangeText={() => undefined}
              secureTextEntry
            />
          </View>
          <View style={[styles.navyPad]}>
            <TextField label="Номер карты" value="4400 •••• •••• 1265" tone="onNavy" readOnly />
          </View>
        </Section>

        {/* ─── MOLECULES ─── */}
        <Section title="Молекулы · UniversityCard">
          <View style={styles.stack}>
            <UniversityCard
              name="Università di Padova"
              city="Падова · Инженерия · англ."
              chance="92%"
              category="safety"
              tags={['2 500 €/год', 'стипендия до 100%', 'IELTS 5.5']}
              onPress={() => undefined}
            />
            <UniversityCard
              name="Università di Bologna"
              city="Болонья · Инженерия · англ."
              chance="71%"
              category="match"
              tags={['3 000 €/год', 'стипендия ER-GO']}
              onPress={() => undefined}
            />
            <UniversityCard
              name="Politecnico di Milano"
              city="Милан · Инженерия · англ."
              chance="34%"
              category="reach"
              tags={['+9 баллов рейтинга', 'портфолио']}
              onPress={() => undefined}
            />
          </View>
        </Section>

        <Section title="Молекулы · FilterOptionRow">
          <View style={styles.stack}>
            {(
              [
                ['Италия', 'щедрые государственные стипендии', '14 вузов'],
                ['Германия', 'обучение почти без платы', '21 вуз'],
                ['Чехия', 'бесплатно на чешском', '9 вузов'],
              ] as const
            ).map(([title, sub, badge]) => (
              <FilterOptionRow
                key={title}
                title={title}
                sub={sub}
                badge={badge}
                selected={filterPick === title}
                onPress={() => setFilterPick(title)}
              />
            ))}
          </View>
        </Section>

        <Section title="Молекулы · TaskModuleCard">
          <TaskModuleCard
            variant="compact"
            kind="КАРТА"
            title="Дорожная карта: IELTS 6.5"
            items={items}
            onToggleItem={toggleItem}
            onOpen={() => undefined}
          />
          <TaskModuleCard
            variant="full"
            kind="ЧЕК-ЛИСТ"
            title="Мотивационное письмо"
            meta="создано ИИ-ментором · 3 из 4 шагов"
            xp={80}
            items={items}
            onToggleItem={toggleItem}
            onOpen={() => undefined}
          />
        </Section>

        <Section title="Молекулы · ChatBubble + ModuleConfirmationCard">
          <ChatBubble text="Короткий ответ ассистента" fromMe={false} />
          <ChatBubble text="Моё сообщение" fromMe />
          <ModuleConfirmationCard
            title="Дорожная карта: IELTS 6.5"
            sub="8 недель · 6 этапов"
            desc="Модуль появится в блоке «Активные задачи»."
            created={checkOn}
            onCreate={() => setCheckOn(true)}
          />
        </Section>

        <Section title="Молекулы · DocumentCell">
          <View style={styles.stack}>
            <DocumentCell
              title="Резюме / CV"
              sub="cv.pdf · 1 стр."
              filled={docFilled}
              onPress={() => setDocFilled((v) => !v)}
              actionFilledLabel="загружено"
              actionEmptyLabel="добавить"
            />
            <DocumentCell
              title="Мотивационное письмо"
              sub="letter_v2.docx"
              filled={!docFilled}
              onPress={() => setDocFilled((v) => !v)}
            />
          </View>
        </Section>

        <Section title="Молекулы · SettingsRow">
          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <SettingsRow title="Профиль и класс" value="11 класс" onPress={() => undefined} />
            <SettingsRow
              title="Тема оформления"
              sub={isDark ? 'Тёмная' : 'Светлая'}
              rightSlot={<Switch value={isDark} onValueChange={toggleTheme} />}
            />
            <SettingsRow title="О нас" onPress={() => undefined} last />
          </View>
          <SettingsRow
            variant="card"
            title="Копилки документов"
            sub="откроется с подпиской"
            badge="PREMIUM"
            onPress={() => undefined}
          />
        </Section>

        <Section title="Молекулы · BentoTile (lock-паттерн)">
          {[tiles.slice(0, 4), tiles.slice(4, 8)].map((row, ri) => (
            <View key={ri} style={styles.bentoRow}>
              {row.map(([label, icon, href, premium, bot]) => (
                <BentoTile
                  key={label}
                  label={label}
                  icon={TILE_ICONS[icon] ?? 'profile'}
                  href={href}
                  premium={premium}
                  variant={bot ? 'bot' : 'default'}
                  onPress={() => undefined}
                  style={styles.bentoCell}
                />
              ))}
            </View>
          ))}
        </Section>

        <Section title="Молекулы · PlanCard" navy>
          <View style={styles.rowGap}>
            <PlanCard
              period="Неделя"
              price="500 тг"
              sub="попробовать"
              selected={planPick === 'week'}
              onPress={() => setPlanPick('week')}
            />
            <PlanCard
              period="Месяц"
              price="1 900 тг"
              sub="≈ 63 тг в день"
              best
              selected={planPick === 'month'}
              onPress={() => setPlanPick('month')}
            />
          </View>
        </Section>

        <Section title="Молекулы · FocusSoundTile" navy>
          <View style={styles.rowGap}>
            {['Белый шум', 'Дождь'].map((name, i) => (
              <View key={name} style={{ flex: 1 }}>
                <FocusSoundTile
                  name={name}
                  sub={i === 0 ? 'ровный фон' : 'мягкий, без грома'}
                  active={sound === i}
                  onPress={() => setSound((s) => (s === i ? null : i))}
                />
              </View>
            ))}
          </View>
        </Section>

        {/* ─── ORGANISMS ─── */}
        <Section title="Организмы · HeaderBar">
          <View style={styles.clip}>
            <HeaderBar
              title="Мои университеты"
              sub="Италия · 14 совпадений · рейтинг 78"
              onBack={() => undefined}
              rightSlot={
                <Text style={[bodyFont('700'), { color: accent.blue, fontSize: 11 }]}>Сменить</Text>
              }
            />
          </View>
          <View style={styles.clip}>
            <HeaderBar
              variant="dark"
              title="Università di Bologna"
              sub="Болонья, Италия · основан в 1088"
              onBack={() => undefined}
            />
          </View>
        </Section>

        <Section title="Организмы · FilterStepper">
          <FilterStepper total={5} current={2} />
        </Section>

        <Section title="Организмы · ResultsGroupedList">
          <ResultsGroupedList
            onOpenUniversity={() => undefined}
            groups={[
              {
                key: 'safety',
                title: 'Безопасный выбор',
                sub: 'Safety · 2',
                category: 'safety',
                items: [
                  {
                    id: 'u1',
                    name: 'Università di Padova',
                    city: 'Падова · Инженерия',
                    chance: '92%',
                    tags: ['2 500 €/год', 'IELTS 5.5'],
                  },
                ],
              },
              {
                key: 'reach',
                title: 'Амбициозная цель',
                sub: 'Reach · 1',
                category: 'reach',
                items: [
                  {
                    id: 'u2',
                    name: 'Università Bocconi',
                    city: 'Милан · Экономика',
                    chance: '21%',
                    tags: ['+14 баллов', 'эссе'],
                  },
                ],
              },
            ]}
          />
        </Section>

        <Section title="Организмы · ActiveTasksBlock (hard-hide для Free)">
          {!isPremium ? (
            <Text style={[bodyFont('500'), styles.note, { color: palette.sub }]}>
              Free: блок не рендерится. Включите Premium сверху.
            </Text>
          ) : null}
          <ActiveTasksBlock
            tasks={[{ id: 't1', kind: 'КАРТА', title: 'Дорожная карта: IELTS 6.5', items }]}
            onToggleItem={(_, itemId) => toggleItem(itemId)}
            onOpenTask={() => undefined}
            onSeeAll={() => undefined}
          />
        </Section>

        <Section title="Организмы · ChatThread + Composer">
          <View style={[styles.chatClip, { borderColor: palette.border }]}>
            <ChatThread
              messages={chat}
              typing={typing}
              onCreateModule={createModule}
              style={styles.chatScroll}
            />
            <Composer
              quickPrompts={['Как усилить письмо?', 'План на неделю']}
              onQuickPrompt={sendChat}
              onSend={sendChat}
            />
          </View>
        </Section>

        <Section title="Организмы · ProfileHeaderWidget">
          <View style={styles.clipTall}>
            <ProfileHeaderWidget
              variant="dashboard"
              name="Батыркызы Тінатін"
              planLabel={isPremium ? 'Premium · до 12 мая' : 'Базовый доступ'}
              isPremium={isPremium}
              level={4}
              xpCurrent={620}
              xpTarget={1000}
              onAvatarPress={() => undefined}
            />
          </View>
          <View style={styles.clipTall}>
            <ProfileHeaderWidget
              variant="profile"
              name="Батыркызы Тінатін"
              planLabel={isPremium ? 'Premium' : 'Базовый доступ'}
              grade={`11 класс · ${isPremium ? 'Premium' : 'Базовый'}`}
              isPremium={isPremium}
              level={4}
              xpCurrent={620}
              xpTarget={1000}
              onBack={() => undefined}
              onSettings={() => undefined}
              stats={[
                { value: '4', label: 'уровень из 100' },
                { value: '620', label: 'XP всего' },
                { value: '14', label: 'подобрано вузов' },
              ]}
            />
          </View>
        </Section>

        <Section title="Организмы · TabBar">
          <View style={[styles.tabStage, { backgroundColor: palette.screen }]}>
            <TabBar activePath={ROUTES.DASHBOARD.path} />
          </View>
          <Text style={[bodyFont('500'), styles.note, { color: palette.sub }]}>
            Вкладка «Задачи» появляется только при Premium.
          </Text>
        </Section>

        <Section title="Организмы · SystemScreenLayout">
          <View style={styles.clipTall}>
            <SystemScreenLayout
              kind="error"
              title="Что-то пошло не так"
              text="Не удалось загрузить данные подбора. Попробуйте ещё раз."
              detail="request_id: 7f3a19 · /universities/results"
              ctaLabel="Повторить"
              onCta={() => undefined}
            />
          </View>
          <View style={styles.clipTall}>
            <SystemScreenLayout
              kind="offline"
              title="Нет соединения"
              text="Приложение работает офлайн: доступны сохранённые вузы и задачи."
              ctaLabel="Продолжить офлайн"
              onCta={() => undefined}
            />
          </View>
        </Section>

        <Section title="Компоненты · BrandLoading">
          <View style={styles.clipTall}>
            <BrandLoading caption="Запуск навигатора" sub="Активируем ваш личный навигатор" />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.toggle}>
      <Text style={[bodyFont('700'), { fontSize: 11, color: palette.sub }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function Section({
  title,
  children,
  navy: onNavy = false,
}: {
  title: string;
  children: ReactNode;
  navy?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[bodyFont('800'), styles.sectionTitle, { color: palette.sub }]}>{title}</Text>
      <View
        style={[
          styles.sectionBody,
          {
            backgroundColor: onNavy ? navy.deep : palette.screen,
            borderColor: palette.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  toolbarTitle: { fontSize: 15 },
  toggles: { flexDirection: 'row', gap: spacing.lg },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: {
    padding: spacing.lg,
    gap: spacing.xxl,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionBody: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stack: { gap: spacing.sm },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  rowGap: { flexDirection: 'row', gap: spacing.md },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoCell: { flex: 1 },
  ringStage: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navyPad: {
    backgroundColor: navy.deep,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  note: { fontSize: 12 },
  clip: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  clipTall: {
    height: 320,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  chatClip: {
    height: 460,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  chatScroll: { flex: 1 },
  tabStage: {
    height: 110,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
