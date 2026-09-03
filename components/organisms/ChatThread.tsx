/**
 * `<ChatThread>` — лента чата ИИ-ментора (`design-reference.html:635`):
 * пузыри `<ChatBubble>`, прикреплённые карточки `<ModuleConfirmationCard>`
 * и индикатор набора. Автопрокрутка вниз при новом сообщении.
 *
 * Индикатор набора мигает через RN `Animated` (базовое поведение
 * компонента; общий пас анимаций spin/pulse/blink по экранам — Фаза 5).
 */

import { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ChatBubble, ModuleConfirmationCard } from '@/components/molecules';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

export interface ChatModule {
  title: string;
  sub: string;
  desc: string;
  created: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  fromMe: boolean;
  module?: ChatModule;
}

interface Props {
  messages: ChatMessage[];
  typing?: boolean;
  onCreateModule: (messageId: string) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function ChatThread({
  messages,
  typing = false,
  onCreateModule,
  style,
  contentContainerStyle,
}: Props) {
  const ref = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={ref}
      style={style}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((m) => (
        <ChatBubble key={m.id} text={m.text} fromMe={m.fromMe}>
          {m.module ? (
            <ModuleConfirmationCard
              title={m.module.title}
              sub={m.module.sub}
              desc={m.module.desc}
              created={m.module.created}
              onCreate={() => onCreateModule(m.id)}
            />
          ) : null}
        </ChatBubble>
      ))}
      {typing ? <TypingIndicator /> : null}
    </ScrollView>
  );
}

function TypingIndicator() {
  const { palette } = useTheme();
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a]);

  return (
    <View style={[styles.typing, { backgroundColor: palette.card, borderColor: palette.border }]}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.typingDot,
            {
              backgroundColor: palette.sub,
              opacity: a.interpolate({
                inputRange: [0, 1],
                outputRange: i === 1 ? [1, 0.25] : [0.25, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 11,
    padding: spacing.lg,
  },
  typing: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
