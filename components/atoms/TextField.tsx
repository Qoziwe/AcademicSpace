/**
 * `<TextField>` — поле ввода с меткой-капсом сверху
 * (`design-reference.html:136` auth-поля, `:970` поля оплаты).
 *
 * Прототип показывает поля только для чтения (значения захардкожены), но
 * экраны Фазы 3 (auth, фильтры, оплата) требуют настоящего ввода — поэтому
 * атом сразу управляемый: `onChangeText` → редактируемое поле,
 * `readOnly`/без обработчика → статичное отображение значения.
 *
 * `tone`: `light` — на светлых карточках (theme-aware), `onNavy` — на
 * брендовом навy-фоне (Paywall/Payment, вне темы).
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, radius } from '@/theme';

export type TextFieldTone = 'light' | 'onNavy';

interface Props {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  tone?: TextFieldTone;
  style?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  readOnly = false,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'sentences',
  tone = 'light',
  style,
}: Props) {
  const { palette } = useTheme();
  const [focused, setFocused] = useState(false);

  const onNavy = tone === 'onNavy';
  const cardBg = onNavy ? 'rgba(255,255,255,0.07)' : palette.card;
  const borderColor = onNavy ? 'transparent' : focused ? accent.blue : palette.border;
  const labelColor = onNavy ? 'rgba(255,255,255,0.45)' : '#9297B5';
  const valueColor = onNavy ? '#FFFFFF' : palette.ink;
  const editable = !readOnly && onChangeText != null;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: cardBg, borderColor, borderWidth: onNavy ? 0 : 1 },
        style,
      ]}
    >
      <Text style={[bodyFont('700'), styles.label, { color: labelColor }]}>{label}</Text>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={onNavy ? 'rgba(255,255,255,0.4)' : palette.sub}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[bodyFont('600'), styles.input, { color: valueColor }]}
        />
      ) : (
        <Text style={[bodyFont('600'), styles.value, { color: valueColor }]}>
          {value || placeholder}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 14,
    marginTop: 5,
    padding: 0,
  },
  value: {
    fontSize: 14,
    marginTop: 5,
  },
});
