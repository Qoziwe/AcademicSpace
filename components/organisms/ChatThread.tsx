/**
 * `<ChatThread>` — лента чата ИИ-ментора (`design-reference.html:635`):
 * пузыри `<ChatBubble>`, прикреплённые карточки `<ModuleConfirmationCard>`
 * и индикатор набора. Автопрокрутка вниз при новом сообщении.
 *
 * Индикатор набора — три точки `<Blink>` 1000 мс с задержками 0/200/400
 * (`design-reference.html:653–655`).
 */

import { useRef } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ChatBubble, ModuleConfirmationCard } from '@/components/molecules';
import { Blink } from '@/components/motion';
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

const TYPING_DELAYS = [0, 200, 400];

function TypingIndicator() {
  const { palette } = useTheme();

  return (
    <View style={[styles.typing, { backgroundColor: palette.card, borderColor: palette.border }]}>
      {TYPING_DELAYS.map((delay) => (
        <Blink
          key={delay}
          durationMs={1000}
          delayMs={delay}
          style={[styles.typingDot, { backgroundColor: palette.sub }]}
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
