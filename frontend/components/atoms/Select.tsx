/**
 * `<Select>` — выпадающий список с фиксированными вариантами. Визуально
 * повторяет обёртку `<TextField>` (метка-капс + значение), но по тапу
 * открывает модальный список опций вместо клавиатуры — для полей с
 * закрытым набором значений (напр. «Класс» на AUTH_SIGNUP).
 */

import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, radius } from '@/theme';

import { Icon } from './Icon';

export interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, value, options, onChange, placeholder = 'Выберите' }: Props) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={[styles.wrap, { backgroundColor: palette.card, borderColor: palette.border }]}
      >
        <View style={styles.textCol}>
          <Text style={[bodyFont('700'), styles.label, { color: '#9297B5' }]}>{label}</Text>
          <Text
            style={[bodyFont('600'), styles.value, { color: selected ? palette.ink : palette.sub }]}
          >
            {selected?.label ?? placeholder}
          </Text>
        </View>
        <Icon name="chevron-down" size={18} color={palette.sub} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: palette.card, paddingBottom: insets.bottom + 12 },
            ]}
          >
            <Text style={[bodyFont('700'), styles.sheetTitle, { color: palette.ink }]}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[styles.option, { borderBottomColor: palette.border }]}
                >
                  <Text style={[bodyFont('600'), styles.optionLabel, { color: palette.ink }]}>
                    {item.label}
                  </Text>
                  {item.value === value ? (
                    <Icon name="check" size={18} color={accent.blue} />
                  ) : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  textCol: { flex: 1, minWidth: 0 },
  label: { fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  value: { fontSize: 14, marginTop: 5 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,17,28,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 16,
    paddingHorizontal: 18,
    maxHeight: '60%',
  },
  sheetTitle: { fontSize: 13, marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionLabel: { fontSize: 14 },
});
