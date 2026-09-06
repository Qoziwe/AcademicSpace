import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/atoms';
import { ChatThread, Composer } from '@/components/organisms';
import { useChatMeta, useCreateChatModule, useSendMessage } from '@/hooks/api/useChat';
import { useTheme } from '@/hooks/useTheme';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, navy, radius } from '@/theme';

/**
 * AI_CHAT (`/ai/chat`, `design-reference.html:624`). Premium-only — Free по
 * deep link редиректится на PAYWALL (`withGuard`). Открывается как таб
 * «ИИ-ментор». История — из `mocks/store.ts` (реактивно); создание модуля
 * → ACTIVE_TASKS.
 */
function AiChatScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  const messages = useMockStore((s) => s.messages);
  const typing = useMockStore((s) => s.chatTyping);
  const metaQ = useChatMeta();
  const sendMessage = useSendMessage();
  const createModule = useCreateChatModule();

  const send = (text: string) => sendMessage.mutate(text);

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.card,
            borderBottomColor: palette.border,
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Назад"
          hitSlop={8}
          onPress={backOr('/dashboard')}
          style={[styles.backChip, { backgroundColor: palette.chip }]}
        >
          <Icon name="chevron-left" size={18} color={palette.ink} />
        </Pressable>
        <View style={styles.botAvatar}>
          <View style={styles.botDots}>
            <View style={styles.botDot} />
            <View style={styles.botDot} />
          </View>
        </View>
        <View style={styles.headerText}>
          <Text style={[bodyFont('800'), styles.headerTitle, { color: palette.ink }]}>
            ИИ-ментор
          </Text>
          <Text style={[bodyFont('500'), styles.headerStatus]}>онлайн · безлимитный доступ</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ChatThread
          style={styles.thread}
          messages={messages}
          typing={typing}
          onCreateModule={(messageId) =>
            createModule.mutate(messageId, { onSuccess: () => router.push('/tasks') })
          }
        />

        <Composer
          quickPrompts={metaQ.data?.quickPrompts ?? []}
          onQuickPrompt={send}
          onSend={send}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 18,
    paddingBottom: 13,
    borderBottomWidth: 1,
  },
  backChip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: navy.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botDots: { flexDirection: 'row', gap: 4 },
  botDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#8FA6FF' },
  headerText: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 14.5 },
  headerStatus: { fontSize: 11, color: accent.green, marginTop: 1 },
  kav: { flex: 1 },
  thread: { flex: 1 },
});

export default withGuard(AiChatScreen, { auth: true, premium: true });
