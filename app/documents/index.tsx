import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Icon, TileIcon } from '@/components/atoms';
import { SlideUp } from '@/components/motion';
import { HeaderBar } from '@/components/organisms';
import { useVaults } from '@/hooks/api/useVaults';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, radius, shadow, spacing } from '@/theme';

/**
 * VAULTS_LIST (`/documents`, `design-reference.html:721`). Premium-only.
 * По одной копилке на выбранный вуз. Назад → PROFILE. Открыть → VAULT_DETAIL.
 */
function VaultsListScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { isWide } = useBreakpoint();
  const vaultsQ = useVaults();

  const vaults = vaultsQ.data ?? [];
  const totalFilled = vaults.reduce((n, v) => n + v.filled, 0);
  const totalCells = vaults.reduce((n, v) => n + v.cellsTotal, 0);

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Копилка документов"
        sub="по одной на каждый выбранный вуз"
        onBack={backOr('/profile')}
      />

      {vaultsQ.data ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        >
          {vaults.length > 0 ? (
            <View
              style={[
                styles.overview,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <View style={styles.overviewIcon}>
                <TileIcon name="vault" />
              </View>
              <View style={styles.overviewText}>
                <Text style={[bodyFont('800'), styles.overviewTitle, { color: palette.ink }]}>
                  {vaults.length} {vaults.length === 1 ? 'копилка' : 'копилки'}
                </Text>
                <Text style={[bodyFont('500'), styles.overviewSub, { color: palette.sub }]}>
                  документов собрано: {totalFilled} из {totalCells}
                </Text>
              </View>
            </View>
          ) : null}

          {vaults.length === 0 ? (
            <View
              style={[styles.empty, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Text style={[bodyFont('700'), styles.emptyTitle, { color: palette.ink }]}>
                Пока нет ни одной копилки
              </Text>
              <Text style={[bodyFont('500'), styles.emptySub, { color: palette.sub }]}>
                Выберите вуз в результатах подбора — копилка документов появится здесь автоматически
              </Text>
            </View>
          ) : (
            <View style={isWide ? styles.grid : styles.stack}>
              {vaults.map((v, i) => {
                const done = v.cellsTotal > 0 && v.filled === v.cellsTotal;
                return (
                  <SlideUp key={v.id} delayMs={i * 60} style={isWide ? styles.gridItem : undefined}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({ pathname: '/documents/[vaultId]', params: { vaultId: v.id } })
                      }
                      style={({ pressed }) => [
                        styles.card,
                        shadow.card,
                        {
                          backgroundColor: palette.card,
                          borderColor: palette.border,
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <View style={styles.cardTop}>
                        <View style={styles.cardIcon}>
                          <TileIcon name="vault" />
                        </View>
                        <View style={styles.cardTitleCol}>
                          <Text style={[bodyFont('800'), styles.name, { color: palette.ink }]}>
                            {v.universityName}
                          </Text>
                          <Text style={[bodyFont('500'), styles.deadline, { color: palette.sub }]}>
                            {v.deadline}
                          </Text>
                        </View>
                        <Icon name="chevron-right" size={17} color={palette.sub} />
                      </View>

                      <View style={styles.cells}>
                        {Array.from({ length: v.cellsTotal }, (_, i2) => (
                          <View
                            key={i2}
                            style={[
                              styles.cell,
                              { backgroundColor: i2 < v.filled ? accent.blue : palette.border },
                            ]}
                          />
                        ))}
                      </View>

                      <View style={styles.cardFoot}>
                        {done ? (
                          <Badge label="ГОТОВО" tone="green" size="sm" dot />
                        ) : (
                          <Text
                            style={[bodyFont('600'), styles.progressNote, { color: palette.sub }]}
                          >
                            собрано {Math.round((v.filled / Math.max(1, v.cellsTotal)) * 100)}%
                          </Text>
                        )}
                        <Text style={[displayFont('600'), styles.count]}>
                          {v.filled}/{v.cellsTotal}
                        </Text>
                      </View>
                    </Pressable>
                  </SlideUp>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={accent.blue} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16 },
  stack: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  gridItem: { flexGrow: 1, flexBasis: 300, maxWidth: 360 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 14,
    marginBottom: 14,
  },
  overviewIcon: { width: 44, height: 44, borderRadius: radius.md, overflow: 'hidden' },
  overviewText: { flex: 1, minWidth: 0 },
  overviewTitle: { fontSize: 14 },
  overviewSub: { fontSize: 11.5, marginTop: 3 },
  empty: { borderWidth: 1, borderRadius: radius.xl, padding: 22, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 14 },
  emptySub: { fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 16 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: { width: 40, height: 40, borderRadius: radius.sm, overflow: 'hidden' },
  cardTitleCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 14 },
  deadline: { fontSize: 11, marginTop: 4 },
  count: { fontSize: 13, color: accent.blue },
  cells: { flexDirection: 'row', gap: 5, marginTop: 14 },
  cell: { flex: 1, height: 6, borderRadius: 3 },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressNote: { fontSize: 11 },
});

export default withGuard(VaultsListScreen, { auth: true, premium: true });
