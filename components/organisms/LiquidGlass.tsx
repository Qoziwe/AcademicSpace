/**
 * `<LiquidGlass>` — фоновый слой «жидкого стекла» (абсолютная заливка,
 * кладётся первым ребёнком в контейнер, напр. в плашку `<TabBar>`).
 *
 * Стекло ПРОЗРАЧНОЕ и только ПРЕЛОМЛЯЕТ фон — без матового размытия
 * (как на iOS). На web (Chromium — Opera/Chrome/Edge) в `backdrop-filter`
 * уходит SVG-фильтр `#academ-liquid-glass`: `feTurbulence` (медленно
 * «дышит» через `<animate>`) → `feGaussianBlur` (сглаживает шум карты
 * смещения в мягкое линзирование, фон при этом НЕ блюрится) →
 * `feDisplacementMap`, который СМЕЩАЕТ реальные пиксели бэкдропа по
 * каналам R/G. Сверху — лёгкий тинт для контраста иконок, стеклянная
 * кромка и диагональный блик.
 *
 * WebKit/Firefox не поддерживают `url()` в `backdrop-filter` → остаётся
 * почти чистая прозрачность (мягкая деградация). Native (iOS/Android):
 * доступа к пикселям бэкдропа из SVG нет — рендерится тот же прозрачный
 * тинт + блик без преломления; настоящая рефракция там потребовала бы
 * GL/Skia-шейдера со снапшотом контента под баром.
 *
 * Тумблер `useDevFlags().liquidGlass` (из `<DevMenu>`): выключение
 * возвращает прежнюю матовую navy-заливку.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDevFlags } from '@/stores/devFlags';

const FILTER_ID = 'academ-liquid-glass';
const SOLID_BG = 'rgba(15,18,48,0.95)'; // прежний фон навбара — фолбэк/выкл.
// Только преломление + лёгкое оживление цвета, БЕЗ blur().
const BACKDROP = `url(#${FILTER_ID}) saturate(140%)`;

interface Props {
  /** Радиус скругления плашки. */
  radius?: number;
  /** Доп. стиль внешнего слоя (обычно `StyleSheet.absoluteFill`). */
  style?: StyleProp<ViewStyle>;
}

/** Один раз добавляет `<svg><filter>` в DOM (только web). */
function ensureWebFilter() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const hostId = `${FILTER_ID}-host`;
  if (document.getElementById(hostId)) return;
  const host = document.createElement('div');
  host.id = hostId;
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
      <filter id="${FILTER_ID}" x="-40%" y="-40%" width="180%" height="180%"
        color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.010 0.014" numOctaves="2"
          seed="7" result="noise">
          <animate attributeName="baseFrequency" dur="22s" repeatCount="indefinite"
            calcMode="linear"
            values="0.010 0.014; 0.014 0.009; 0.011 0.016; 0.010 0.014" />
        </feTurbulence>
        <feGaussianBlur in="noise" stdDeviation="3.6" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale="30"
          xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>`;
  document.body.appendChild(host);
}

export function LiquidGlass({ radius = 24, style }: Props) {
  const enabled = useDevFlags((s) => s.liquidGlass);
  const ref = useRef<View>(null);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'web') return;
    ensureWebFilter();
    // Дублируем backdrop-filter напрямую на DOM-узел — на случай, если
    // react-native-web не пробросит нестандартный стиль.
    const node = ref.current as unknown as HTMLElement | null;
    if (node?.style) {
      node.style.backdropFilter = BACKDROP;
      // Safari: url()-фильтр не поддержан — только keyword-часть.
      node.style.setProperty('-webkit-backdrop-filter', 'saturate(140%)');
    }
  }, [enabled]);

  // ── Выключено: прежняя матовая заливка ─────────────────────────────
  if (!enabled) {
    return (
      <View
        pointerEvents="none"
        style={[styles.shadow, { borderRadius: radius, backgroundColor: SOLID_BG }, style]}
      />
    );
  }

  const rounded = { borderRadius: radius } as const;
  const webBackdrop =
    Platform.OS === 'web'
      ? ({
          backdropFilter: BACKDROP,
          WebkitBackdropFilter: 'saturate(140%)',
        } as unknown as ViewStyle)
      : null;

  return (
    <View
      ref={ref}
      pointerEvents="none"
      style={[styles.shadow, styles.clip, rounded, webBackdrop, style]}
    >
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0.10)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, rounded, styles.rim]} />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  shadow: {
    shadowColor: 'rgba(10,13,40,1)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 16,
  },
  // Очень лёгкий тинт — только чтобы белые иконки читались на любом фоне.
  tint: { backgroundColor: 'rgba(17,20,50,0.16)' },
  // Кромка-бликом по периметру (стеклянный кант).
  rim: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
});
