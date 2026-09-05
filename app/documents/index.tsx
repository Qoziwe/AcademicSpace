import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBar } from '@/components/organisms';
import { useVaults } from '@/hooks/api/useVaults';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, radius, shadow } from '@/theme';

/**
 * VAULTS_LIST (`/documents`, `design-reference.html:721`). Premium-only.
 * По одной копилке на выбранный вуз. Назад → PROFILE. Открыть → VAULT_DETAIL.
 */
function VaultsListScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { isWide } = useBreakpoint();
  const vaultsQ = useVaults();

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
          <View style={isWide ? styles.grid : styles.stack}>
            {vaultsQ.data.map((v) => (
              <Pressable
                key={v.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/documents/[vaultId]', params: { vaultId: v.id } })
                }
                style={({ pressed }) => [
                  styles.card,
                  shadow.card,
                  isWide && styles.cardGrid,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleCol}>
                    <Text style={[bodyFont('800'), styles.name, { color: palette.ink }]}>
                      {v.universityName}
                    </Text>
                    <Text style={[bodyFont('500'), styles.deadline, { color: palette.sub }]}>
                      {v.deadline}
                    </Text>
                  </View>
                  <Text style={[displayFont('600'), styles.count]}>
                    {v.filled}/{v.cellsTotal}
                  </Text>
                </View>
                <View style={styles.cells}>
                  {Array.from({ length: v.cellsTotal }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.cell,
                        { backgroundColor: i < v.filled ? accent.blue : palette.border },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
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
  stack: { gap: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 16 },
  cardGrid: { flexGrow: 1, flexBasis: 300, maxWidth: 360 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 14 },
  deadline: { fontSize: 11, marginTop: 4 },
  count: { fontSize: 13, color: accent.blue },
  cells: { flexDirection: 'row', gap: 5, marginTop: 13 },
  cell: { flex: 1, height: 6, borderRadius: 3 },
});

export default withGuard(VaultsListScreen, { auth: true, premium: true });
