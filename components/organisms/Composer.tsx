/**
 * `<Composer>` — нижняя панель ввода чата (`design-reference.html:659`):
 * горизонтальная лента быстрых подсказок (`quickPrompts`) + поле ввода +
 * кнопка отправки (48×48, `navy.primary`).
 *
 * Управляет собственным черновиком. `disabled` — режим превью для Free
 * (`inputPlaceholder: 'Доступно в Premium'`): поле и подсказки неактивны.
 */

import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/atoms';
import { TAB_BAR_BAR_HEIGHT } from '@/components/organisms/TabBar';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, navy, radius, spacing } from '@/theme';

interface Props {
  quickPrompts: string[];
  onQuickPrompt: (text: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export function Composer({
  quickPrompts,
  onQuickPrompt,
  onSend,
  disabled = false,
  placeholder = 'Сообщение ИИ-ментору…',
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const [value, setValue] = useState('');

  const canSend = !disabled && value.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
          // AI_CHAT — таб-рут: плавающий таб-бар висит над композером,
          // добавляем его высоту, чтобы поле ввода не уходило под бар.
          paddingBottom: Math.max(insets.bottom, 12) + 12 + TAB_BAR_BAR_HEIGHT,
        },
        style,
      ]}
    >
      {quickPrompts.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prompts}
        >
          {quickPrompts.map((q) => (
            <Pressable
              key={q}
              disabled={disabled}
              onPress={() => onQuickPrompt(q)}
              style={({ pressed }) => [
                styles.prompt,
                { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[bodyFont('600'), styles.promptText]}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.inputRow}>
        <View style={[styles.field, { backgroundColor: palette.chip }]}>
          <TextInput
            value={value}
            onChangeText={setValue}
            editable={!disabled}
            placeholder={placeholder}
            placeholderTextColor={palette.sub}
            onSubmitEditing={submit}
            returnKeyType="send"
            style={[bodyFont('500'), styles.input, { color: palette.ink }]}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Отправить"
          disabled={!canSend}
          onPress={submit}
          style={({ pressed }) => [styles.send, { opacity: !canSend ? 0.4 : pressed ? 0.85 : 1 }]}
        >
          <Icon name="arrow-up" size={18} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
  },
  prompts: {
    gap: 7,
    paddingBottom: 9,
  },
  prompt: {
    backgroundColor: 'rgba(46,107,255,0.10)',
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  promptText: {
    fontSize: 11.5,
    color: accent.blue,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  field: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 13,
    padding: 0,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: navy.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
