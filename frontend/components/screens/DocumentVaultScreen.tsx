/**
 * Общий экран копилки документов — REQUIRED_DOCUMENTS и VAULT_DETAIL
 * рисуются по одному паттерну (`design-reference.html:746`, `isVault`;
 * screen-inventory говорит собрать REQUIRED_DOCUMENTS «по аналогии с
 * VAULT_DETAIL-паттерном»).
 *
 * Навy-шапка с прогрессом заполнения + список `<DocumentCell>`. Данные —
 * `useVault(vaultId)`, загрузка/замена файла — реальный
 * `expo-document-picker` + `useUploadVaultCell()` (Фаза 8.8, часть 2).
 */

import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, ProgressBar } from '@/components/atoms';
import { DocumentCell } from '@/components/molecules';
import { useUploadVaultCell, useVault } from '@/hooks/api/useVaults';
import { useTheme } from '@/hooks/useTheme';
import { bodyFont, displayFont, navy, radius, spacing } from '@/theme';

interface Props {
  vaultId: string;
  title: string;
  /** Подпись под заголовком (дедлайн / «9 ячеек» и т.п.). */
  caption: string;
  onBack: () => void;
}

export function DocumentVaultScreen({ vaultId, title, caption, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const vaultQ = useVault(vaultId);
  const upload = useUploadVaultCell();
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const cells = vaultQ.data?.cells ?? [];
  const filled = vaultQ.data?.filled ?? cells.filter((c) => c.uploaded).length;
  const total = vaultQ.data?.cellsTotal ?? cells.length;

  const pickAndUpload = async (index: number) => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;

    setPendingIndex(index);
    try {
      await upload.mutateAsync({
        vaultId,
        cellIndex: index,
        file: { uri: asset.uri, name: asset.name, mimeType: asset.mimeType },
      });
    } finally {
      setPendingIndex(null);
    }
  };

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
          <Icon name="chevron-left" size={18} color="#FFFFFF" />
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
        {cells.map((cell, i) => (
          <DocumentCell
            key={cell.title}
            title={cell.title}
            sub={cell.sub}
            filled={cell.uploaded}
            onPress={() => void pickAndUpload(i)}
            actionFilledLabel={pendingIndex === i ? 'загрузка…' : 'заменить'}
            actionEmptyLabel={pendingIndex === i ? 'загрузка…' : 'загрузить'}
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
