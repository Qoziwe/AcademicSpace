/**
 * `<ChatBubble>` — пузырь сообщения в чате ИИ-ментора
 * (`design-reference.html:637`, `messages[].bubble`). `fromMe` → выравнивание
 * вправо, фон `navy.primary`, белый текст, «хвост» справа снизу; иначе —
 * влево, фон `palette.card` с обводкой, «хвост» слева снизу.
 *
 * `children` — прикреплённая карточка (`<ModuleConfirmationCard>`).
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { bodyFont, navy } from '@/theme';

interface Props {
  text: string;
  fromMe: boolean;
  children?: ReactNode;
}

export function ChatBubble({ text, fromMe, children }: Props) {
  const { palette } = useTheme();

  return (
    <View style={[styles.wrap, { alignItems: fromMe ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          fromMe
            ? { backgroundColor: navy.primary, borderBottomRightRadius: 6 }
            : {
                backgroundColor: palette.card,
                borderWidth: 1,
                borderColor: palette.border,
                borderBottomLeftRadius: 6,
              },
        ]}
      >
        <Text style={[bodyFont('500'), styles.text, { color: fromMe ? '#FFFFFF' : palette.ink }]}>
          {text}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  bubble: {
    maxWidth: 272,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 18,
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
  },
});
