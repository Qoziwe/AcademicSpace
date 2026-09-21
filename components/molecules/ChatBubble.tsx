/**
 * `<ChatBubble>` — пузырь сообщения в чате ИИ-ментора
 * (`design-reference.html:637`, `messages[].bubble`). `fromMe` → выравнивание
 * вправо, фон `navy.primary`, белый текст, «хвост» справа снизу; иначе —
 * влево, фон `palette.card` с обводкой, «хвост» слева снизу.
 *
 * `children` — прикреплённая карточка (`<ModuleConfirmationCard>`).
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { bodyFont, navy, shadow } from '@/theme';

interface Props {
  text: string;
  fromMe: boolean;
  children?: ReactNode;
}

export function ChatBubble({ text, fromMe, children }: Props) {
  const { palette } = useTheme();

  return (
    <View style={[styles.wrap, { alignItems: fromMe ? 'flex-end' : 'flex-start' }]}>
      {fromMe ? (
        <LinearGradient
          colors={['#3A41A0', navy.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.bubbleMe]}
        >
          <Text style={[bodyFont('500'), styles.text, { color: '#FFFFFF' }]}>{text}</Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.bubble,
            styles.bubbleThem,
            shadow.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Text style={[bodyFont('500'), styles.text, { color: palette.ink }]}>{text}</Text>
        </View>
      )}
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
  bubbleMe: { borderBottomRightRadius: 6 },
  bubbleThem: { borderWidth: 1, borderBottomLeftRadius: 6 },
  text: {
    fontSize: 13,
    lineHeight: 20,
  },
});
