/**
 * Общий презентационный экран авторизации (`design-reference.html:118`,
 * `isAuth`). В реестре роутов это два honest-роута — `AUTH_SIGNUP` и
 * `AUTH_SIGNIN` (`CLAUDE.md` §7); сегмент-контрол переключает их через
 * `router.replace`, а вёрстка общая.
 *
 * Экран использует `screenBgStyle` прототипа (внешний фон theme-aware) —
 * внутренние карточки доведены до 7-токенного паттерна (`CLAUDE.md` §8).
 */

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, TextField } from '@/components/atoms';
import { useSignIn, useSignUp } from '@/hooks/api/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { bodyFont, displayFont, radius, spacing } from '@/theme';

export type AuthMode = 'signup' | 'signin';

interface Props {
  mode: AuthMode;
}

export function AuthScreen({ mode }: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const signUp = useSignUp();
  const signIn = useSignIn();

  const [name, setName] = useState('Тінатін Батыркызы');
  const [email, setEmail] = useState('tinatin@mail.kz');
  const [grade, setGrade] = useState('11 класс');
  const [password, setPassword] = useState('');

  const isSignup = mode === 'signup';
  const pending = signUp.isPending || signIn.isPending;

  const submit = () => {
    if (pending) return;
    const onSuccess = () => router.push('/auth/loading');
    if (isSignup) {
      signUp.mutate({ name, email, grade, password }, { onSuccess });
    } else {
      signIn.mutate({ email, password }, { onSuccess });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          onPress={() => router.push('/welcome')}
          style={[styles.backChip, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <Feather name="chevron-left" size={16} color={palette.ink} />
        </Pressable>

        <View style={styles.headings}>
          <Text style={[displayFont('600'), styles.title, { color: palette.ink }]}>
            {isSignup ? 'Создать аккаунт' : 'С возвращением'}
          </Text>
          <Text style={[bodyFont('500'), styles.sub, { color: palette.sub }]}>
            {isSignup
              ? 'Займёт меньше минуты — данные анкеты добавите позже'
              : 'Войдите, чтобы вернуться к своему подбору'}
          </Text>
        </View>

        <View style={[styles.segment, { backgroundColor: palette.border }]}>
          <SegmentTab
            label="Регистрация"
            active={isSignup}
            onPress={() => router.replace('/auth/signup')}
          />
          <SegmentTab
            label="Вход"
            active={!isSignup}
            onPress={() => router.replace('/auth/signin')}
          />
        </View>

        <View style={styles.fields}>
          {isSignup ? (
            <TextField
              label="Имя и фамилия"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          ) : null}
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {isSignup ? <TextField label="Класс" value={grade} onChangeText={setGrade} /> : null}
          <TextField
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.footer}>
          <Button
            label={isSignup ? 'Создать аккаунт' : 'Войти'}
            tone="navy"
            elevated
            loading={pending}
            onPress={submit}
          />
          <Text style={[bodyFont('400'), styles.legal, { color: palette.sub }]}>
            Продолжая, вы принимаете условия и политику конфиденциальности
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SegmentTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.segmentTab, active && { backgroundColor: palette.card }]}
    >
      <Text
        style={[bodyFont('700'), styles.segmentText, { color: active ? palette.ink : palette.sub }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    gap: spacing.xl,
  },
  backChip: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headings: { gap: 7 },
  title: { fontSize: 24, letterSpacing: -0.6 },
  sub: { fontSize: 13 },
  segment: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  segmentText: { fontSize: 12.5 },
  fields: { gap: spacing.md },
  footer: { marginTop: 'auto', gap: spacing.md, paddingTop: spacing.lg },
  legal: { fontSize: 10.5, textAlign: 'center', lineHeight: 15 },
});
