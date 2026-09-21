import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Icon } from '@/components/atoms';
import { useUniversity } from '@/hooks/api/useUniversity';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, navy, radius, spacing } from '@/theme';

/**
 * UNIVERSITY_DETAILS (`/universities/:id`, `design-reference.html:444`).
 * Навy-шапка (вне темы) + theme-aware тело. Блок документов: Premium →
 * VAULT_DETAIL; Free → lock-тизер → PAYWALL (`CLAUDE.md` §6).
 */

const CATEGORY_BADGE = {
  safety: { label: 'SAFETY', tone: 'green' as const },
  match: { label: 'MATCH', tone: 'onNavy' as const },
  reach: { label: 'REACH', tone: 'rose' as const },
};

function UniversityDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const uniQ = useUniversity(id ?? 'bologna');
  const data = uniQ.data;

  const isPremium = data?.requiredDocuments != null;

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityLabel="Назад"
          hitSlop={8}
          onPress={backOr('/universities/results')}
          style={styles.backChip}
        >
          <Icon name="chevron-left" size={18} color="#FFFFFF" />
        </Pressable>

        {data ? (
          <>
            <Badge
              label={CATEGORY_BADGE[data.category].label}
              tone={CATEGORY_BADGE[data.category].tone}
              dot
              style={styles.badge}
            />
            <Text style={[displayFont('600'), styles.name]}>{data.name}</Text>
            <Text style={[bodyFont('500'), styles.city]}>{data.city}</Text>
            <View style={styles.stats}>
              {data.stats.map((s) => (
                <View key={s.k} style={styles.statCard}>
                  <Text style={[displayFont('600'), styles.statV]}>{s.v}</Text>
                  <Text style={[bodyFont('500'), styles.statK]}>{s.k}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <ActivityIndicator color="#FFFFFF" style={styles.heroLoading} />
        )}
      </View>

      {data ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        >
          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[bodyFont('800'), styles.cardTitle, { color: palette.ink }]}>
              Программа
            </Text>
            {data.rows.map((r) => (
              <View key={r.k} style={styles.progRow}>
                <Text style={[bodyFont('500'), styles.progK, { color: palette.sub }]}>{r.k}</Text>
                <Text style={[bodyFont('700'), styles.progV, { color: palette.ink }]}>{r.v}</Text>
              </View>
            ))}
            <Button
              label="Сайт приёмной комиссии"
              variant="secondary"
              size="sm"
              onPress={() => Linking.openURL(data.admissionsUrl)}
              iconRight={<Icon name="arrow-up-right" size={15} color={accent.blue} />}
              style={styles.siteBtn}
            />
          </View>

          {isPremium ? (
            <View
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Text style={[bodyFont('800'), styles.cardTitle, { color: palette.ink }]}>
                Документы для поступления
              </Text>
              <Text style={[bodyFont('500'), styles.docText, { color: palette.sub }]}>
                {data.documentsNote}
              </Text>
              <Button
                label="Открыть копилку"
                tone="blue"
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: '/documents/[vaultId]',
                    params: { vaultId: id ?? 'bologna' },
                  })
                }
                style={styles.docBtn}
              />
            </View>
          ) : (
            <View style={styles.lockCard}>
              <View style={styles.lockHead}>
                <Text style={[bodyFont('800'), styles.lockTitle]}>Документы для поступления</Text>
                <Badge label="PREMIUM" tone="gold" size="sm" />
              </View>
              <Text style={[bodyFont('500'), styles.lockText]}>{data.documentsNote}</Text>
              <Button
                label="Разблокировать в Premium"
                tone="gold"
                size="sm"
                onPress={() => router.push('/subscription/offer')}
                style={styles.docBtn}
              />
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.bodyLoading}>
          <ActivityIndicator color={accent.blue} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    backgroundColor: navy.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: 26,
  },
  backChip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLoading: { marginTop: 24 },
  badge: { marginTop: 18 },
  name: {
    fontSize: 22,
    lineHeight: 27.5,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginTop: 10,
  },
  city: { fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 7 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 18 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  statV: { fontSize: 14, color: '#FFFFFF' },
  statK: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 11 },
  bodyLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 16, gap: 10 },
  cardTitle: { fontSize: 12.5 },
  progRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  progK: { fontSize: 12 },
  progV: { fontSize: 12.5, textAlign: 'right', flexShrink: 1 },
  siteBtn: { marginTop: 4 },
  docText: { fontSize: 12, lineHeight: 18.5 },
  docBtn: { marginTop: 4 },
  lockCard: {
    backgroundColor: navy.deep,
    borderRadius: radius.xl,
    padding: 16,
    gap: 8,
  },
  lockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  lockTitle: { fontSize: 13.5, color: '#FFFFFF' },
  lockText: { fontSize: 12, lineHeight: 18.5, color: 'rgba(255,255,255,0.6)' },
});

export default withGuard(UniversityDetailsScreen, { auth: true });
