import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo, Button } from '@/components/atoms';
import { withGuard } from '@/navigation/withGuard';
import { bodyFont, displayFont, navy, radius, spacing } from '@/theme';

/**
 * WELCOME (`/welcome`, `design-reference.html:94`). Брендовый навy-экран
 * (вне темы). Точки входа: SPLASH. Назад — нет.
 */
const BULLETS = [
  'Safety · Match · Reach подборка вузов',
  'ИИ-стратегия по вашему портфолио',
  '100 уровней за реальные достижения',
];

function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.hero}>
          <BrandLogo size={40} style={styles.logo} />
          <Text style={[displayFont('600'), styles.headline]}>
            Спроектируй своё будущее уже сегодня
          </Text>
          <Text style={[bodyFont('400'), styles.sub]}>
            Алгоритм оценит твои академические данные, а ИИ соберёт персональную стратегию
            поступления: Safety, Match и Reach вузы, дорожные карты и копилка документов.
          </Text>

          <View style={styles.bullets}>
            {BULLETS.map((b) => (
              <View key={b} style={styles.bullet}>
                <View style={styles.bulletDot} />
                <Text style={[bodyFont('500'), styles.bulletText]}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Начать путь"
            tone="contrast"
            elevated
            onPress={() => router.push('/auth/signup')}
          />
          <Button
            label="У меня уже есть аккаунт"
            variant="ghost"
            size="md"
            color="rgba(255,255,255,0.8)"
            borderColor="rgba(255,255,255,0.18)"
            onPress={() => router.push('/auth/signin')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: navy.primary },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
    gap: spacing.xxl,
  },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.md },
  logo: { marginBottom: 18 },
  headline: {
    fontSize: 29,
    lineHeight: 35,
    letterSpacing: -0.7,
    color: '#FFFFFF',
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.6)',
  },
  bullets: { gap: 9, marginTop: 12 },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7C93FF',
  },
  bulletText: { fontSize: 12.5, color: 'rgba(255,255,255,0.82)', flex: 1 },
  actions: { gap: spacing.md },
});

export default withGuard(WelcomeScreen);
