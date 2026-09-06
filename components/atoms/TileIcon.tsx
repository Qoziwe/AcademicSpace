/**
 * `<TileIcon>` — крупная цветная иконка плитки быстрого доступа на главном
 * экране (`app/dashboard.tsx` → `<BentoTile>`). Рисуется на весь размер
 * плитки (`width/height="100%"`): подложка своего оттенка кроет кнопку
 * целиком, а двухцветный округлый глиф сидит в `<G>` — сдвинут вверх и
 * чуть уменьшен (`GLYPH_TF`), чтобы не заходить под нижнюю подпись плитки.
 *
 * Палитра — из `theme/tokens` (`accent` / `navy`), мягкие подложки —
 * осветлённые версии тех же цветов, общие для light/dark (плитки на
 * главном сознательно вне темы, как navy-зона дашборда).
 */

import type { ReactNode } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export type TileIconName =
  'profile' | 'vault' | 'universities' | 'questionnaire' | 'journal' | 'focus' | 'tasks' | 'mentor';

interface Props {
  name: TileIconName;
  /** viewBox 64; масштабируется контейнером. */
  size?: number;
}

/** Глиф: ×0.86 от центра (32,32) + 5px вверх — освобождает место под подпись. */
const GLYPH_TF = 'translate(4.48 -0.52) scale(0.86)';

/** Подложка с запасом — кроет плитку даже при `slice`-обрезке. */
function bg(fill: string) {
  return <Rect x={-6} y={-6} width={76} height={76} rx={24} fill={fill} />;
}

/** Общий помощник обводки глифа. */
function g(color: string, w = 3.6) {
  return {
    stroke: color,
    strokeWidth: w,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
}

export function TileIcon({ name, size }: Props) {
  const dims = size
    ? { width: size, height: size }
    : { width: '100%' as const, height: '100%' as const };
  const spec = SPECS[name];
  return (
    // `slice` — подложка кроет всю плитку и на неквадратных (desktop 140×82)
    // ячейках; скругление даёт `overflow:hidden` родителя.
    <Svg {...dims} viewBox="0 0 64 64" fill="none" preserveAspectRatio="xMidYMid slice">
      {spec.bg}
      <G transform={GLYPH_TF}>{spec.glyph}</G>
    </Svg>
  );
}

const SPECS: Record<TileIconName, { bg: ReactNode; glyph: ReactNode }> = {
  profile: {
    bg: bg('#E8EEFF'),
    glyph: (
      <>
        <Circle cx={32} cy={25} r={8.5} {...g('#2E6BFF')} />
        <Path d="M16 48a16 16 0 0 1 32 0" {...g('#7C93FF')} />
      </>
    ),
  },
  vault: {
    bg: bg('#E3F6EE'),
    glyph: (
      <>
        <Path d="M23 20v-3a9 9 0 0 1 18 0v3" {...g('#7FD9B4')} />
        <Rect x={14} y={20} width={36} height={30} rx={8} {...g('#1FB574')} />
        <Circle cx={32} cy={33} r={4.5} fill="#1FB574" />
        <Path d="M32 37v6" {...g('#1FB574')} />
      </>
    ),
  },
  universities: {
    bg: bg('#E8EEFF'),
    glyph: (
      <>
        <Path d="M32 17 54 27 32 37 10 27z" {...g('#2C317A')} />
        <Path d="M20 31V41c0 3.6 5.4 6.5 12 6.5s12-2.9 12-6.5V31" {...g('#2E6BFF')} />
        <Path d="M49 28V38" {...g('#2C317A')} />
        <Circle cx={49} cy={40.5} r={2.8} fill="#F3C24B" />
      </>
    ),
  },
  questionnaire: {
    bg: bg('#FBE7F0'),
    glyph: (
      <>
        <Rect x={15} y={16} width={34} height={37} rx={8} {...g('#E2739B')} />
        <Rect x={25} y={12} width={14} height={9} rx={3.5} fill="#F3A9C6" />
        <Path d="M22.5 32l3.2 3.2 5.3-5.6" {...g('#E2739B')} />
        <Path d="M36 32.5h7" {...g('#F3A9C6')} />
        <Path d="M22.5 43h20" {...g('#F3A9C6')} />
      </>
    ),
  },
  journal: {
    bg: bg('#FCF1DA'),
    glyph: (
      <>
        <Path d="M19 15h23a4 4 0 0 1 4 4v30H23a4 4 0 0 1-4-4z" {...g('#E0A93C')} />
        <Path d="M19 15v34" {...g('#E0A93C')} />
        <Path d="M39 15v15l-4.5-3.6L30 30V15z" fill="#F3C24B" />
      </>
    ),
  },
  focus: {
    bg: bg('#E9ECFF'),
    glyph: (
      <>
        <Circle cx={32} cy={36} r={14} {...g('#5B6BE0')} />
        <Path d="M26 16h12" {...g('#5B6BE0')} />
        <Path d="M32 16v6" {...g('#5B6BE0')} />
        <Path d="M32 36l7-4" {...g('#7C93FF')} />
      </>
    ),
  },
  tasks: {
    bg: bg('#E3F6EE'),
    glyph: (
      <>
        <Rect x={13} y={14} width={12} height={12} rx={4} {...g('#1FB574')} />
        <Path d="M15.8 20l2.2 2.2 4-4.4" {...g('#128A55')} />
        <Rect x={13} y={38} width={12} height={12} rx={4} {...g('#1FB574')} />
        <Path d="M15.8 44l2.2 2.2 4-4.4" {...g('#128A55')} />
        <Path d="M31 20h20" {...g('#7FD9B4')} />
        <Path d="M31 44h14" {...g('#7FD9B4')} />
      </>
    ),
  },
  mentor: {
    bg: (
      <>
        <Defs>
          <LinearGradient id="tileMentor" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2C317A" />
            <Stop offset="1" stopColor="#2E6BFF" />
          </LinearGradient>
        </Defs>
        <Rect x={-6} y={-6} width={76} height={76} rx={24} fill="url(#tileMentor)" />
      </>
    ),
    glyph: (
      <>
        <Rect x={14} y={24} width={36} height={26} rx={11} {...g('#FFFFFF', 3.4)} />
        <Path d="M32 24v-5" {...g('#FFFFFF', 3.4)} />
        <Circle cx={32} cy={16} r={3.2} fill="#F3C24B" />
        <Circle cx={25} cy={36} r={3.2} fill="#8FA6FF" />
        <Circle cx={39} cy={36} r={3.2} fill="#8FA6FF" />
        <Path d="M26 43c2.2 2.2 9.8 2.2 12 0" {...g('#FFFFFF', 3.4)} />
      </>
    ),
  },
};
