/**
 * `<BrandLogo>` — лого-знак AcademicSpace.
 *
 * Читает `constants/brand.ts → logo.mode`:
 *  - `diamond` — временный градиентный ромб из дизайна (accent.blue →
 *    accent.blueLight, повёрнут на 45°), `design-reference.html:83/98/170`;
 *  - `image` — растровый логотип из брендбука (когда появится, код экранов
 *    не меняется — `docs/design-tokens.md` закрытый вопрос №3).
 */

import { Image, type ImageStyle } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BRAND } from '@/constants/brand';

interface Props {
  /** Визуальный размер знака в px. Прототип: 24 (шапка) … 46 (сплэш). */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function BrandLogo({ size = 40, style }: Props) {
  // Радиус ромба ≈ 0.3 от размера (r14 при 46, r13 при 40, r8 при 24).
  const borderRadius = Math.round(size * 0.3);

  if (BRAND.logo.mode === 'image' && BRAND.logo.source) {
    return (
      <Image
        source={BRAND.logo.source}
        style={[{ width: size, height: size }, style as StyleProp<ImageStyle>]}
        contentFit="contain"
      />
    );
  }

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <LinearGradient
        colors={[BRAND.logo.diamondGradient[1], BRAND.logo.diamondGradient[0]]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{ width: size, height: size, borderRadius, transform: [{ rotate: '45deg' }] }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
