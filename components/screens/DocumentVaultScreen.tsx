/**
 * Общий экран копилки документов — REQUIRED_DOCUMENTS и VAULT_DETAIL
 * рисуются по одному паттерну (`design-reference.html:746`, `isVault`;
 * screen-inventory говорит собрать REQUIRED_DOCUMENTS «по аналогии с
 * VAULT_DETAIL-паттерном»).
 *
 * Навy-шапка с прогрессом заполнения + список `<DocumentCell>`. Ячейки
 * переключаются на месте (мок file-picker) через `mocks/store.ts.vaultCells`.
 */

import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/atoms';
import { DocumentCell } from '@/components/molecules';
import { useTheme } from '@/hooks/useTheme';
import { DOCUMENT_SLOTS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { bodyFont, displayFont, navy, radius, spacing } from '@/theme';

interface Props {
  title: string;
  /** Подпись под заголовком (дедлайн / «9 ячеек» и т.п.). */
  caption: string;
  onBack: () => void;
}

export function DocumentVaultScreen({ title, caption, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const cells = useMockStore((s) => s.vaultCells);
  const toggleCell = useMockStore((s) => s.toggleVaultCell);

  const filled = cells.filter(Boolean).length;
  const total = DOCUMENT_SLOTS.length;

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          hitSlop={8}
          onPress={onBack}
          style={styles.backChip}
        >
          <Feather name="chevron-left" size={16} color="#FFFFFF" />
        </Pressable>
        <Text style={[displayFont('600'), styles.title]}>{title}</Text>
        <Text style={[bodyFont('500'), styles.caption]}>
          {caption} · заполнено {filled} из {total}
        </Text>
        <ProgressBar
          value={total > 0 ? filled / total : 0}
          height={6}
          trackColor="rgba(255,255,255,0.16)"
          fillColor="#7C93FF"
          style={styles.bar}
        />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        {DOCUMENT_SLOTS.map((slot, i) => (
          <DocumentCell
            key={slot.title}
            title={slot.title}
            sub={slot.filledSub}
            filled={cells[i] ?? false}
            onPress={() => toggleCell(i)}
            actionFilledLabel="заменить"
            actionEmptyLabel="загрузить"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    backgroundColor: navy.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: 22,
  },
  backChip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 19, color: '#FFFFFF', letterSpacing: -0.4 },
  caption: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  bar: { marginTop: 14 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 9 },
});
