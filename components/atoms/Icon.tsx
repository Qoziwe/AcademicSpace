/**
 * `<Icon>` — единый набор UI-иконок AcademicSpace на `react-native-svg`
 * (заменяет шрифтовой `@expo/vector-icons`). Стиль: тонкая округлая
 * линия (`strokeLinecap="round"`, `strokeLinejoin="round"`, viewBox 24),
 * один цвет через `color`. Для крупных цветных иконок плиток главного
 * экрана — отдельный компонент `<TileIcon>`.
 *
 * Размер по умолчанию 20, толщина линии 1.8 (масштабируется от размера,
 * чтобы мелкие иконки не «плыли»).
 */

import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-up-right'
  | 'menu'
  | 'stop'
  | 'file'
  | 'home'
  | 'compass'
  | 'chat'
  | 'check-square'
  | 'user'
  | 'settings'
  | 'dot'
  | 'check'
  | 'lock'
  | 'sparkles';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  /** Абсолютная толщина линии; по умолчанию — от размера (~1.8 при 20). */
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 20, color = '#1B1F4B', strokeWidth, style }: Props) {
  const sw = strokeWidth ?? Math.max(1.35, (size / 20) * 1.8);
  const stroke = {
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {render(name, color, stroke)}
    </Svg>
  );
}

type StrokeProps = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
};

function render(name: IconName, color: string, s: StrokeProps) {
  switch (name) {
    case 'chevron-left':
      return <Path d="M14.5 5 8 12l6.5 7" {...s} />;
    case 'chevron-right':
      return <Path d="M9.5 5 16 12l-6.5 7" {...s} />;
    case 'chevron-up':
      return <Path d="M5 14.5 12 8l7 6.5" {...s} />;
    case 'chevron-down':
      return <Path d="M5 9.5 12 16l7-6.5" {...s} />;
    case 'arrow-right':
      return (
        <>
          <Path d="M4.5 12h14.5" {...s} />
          <Path d="M13 6l6 6-6 6" {...s} />
        </>
      );
    case 'arrow-up':
      return (
        <>
          <Path d="M12 19.5V5" {...s} />
          <Path d="M6 11l6-6 6 6" {...s} />
        </>
      );
    case 'arrow-up-right':
      return (
        <>
          <Path d="M7 17 17 7" {...s} />
          <Path d="M8.5 7H17v8.5" {...s} />
        </>
      );
    case 'menu':
      return (
        <>
          <Path d="M4 7h16" {...s} />
          <Path d="M4 12h16" {...s} />
          <Path d="M4 17h16" {...s} />
        </>
      );
    case 'stop':
      return <Rect x={6} y={6} width={12} height={12} rx={3.5} {...s} />;
    case 'file':
      return (
        <>
          <Path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" {...s} />
          <Path d="M13.5 3v5.5H19" {...s} />
          <Path d="M9 13.5h6" {...s} />
          <Path d="M9 17h4.5" {...s} />
        </>
      );
    case 'home':
      return (
        <>
          <Path d="M4 11.5 12 5l8 6.5" {...s} />
          <Path d="M6.2 10.5V19a1 1 0 0 0 1 1h9.6a1 1 0 0 0 1-1v-8.5" {...s} />
        </>
      );
    case 'compass':
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...s} />
          <Path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z" {...s} />
        </>
      );
    case 'chat':
      return (
        <Path d="M20 11.5a7.7 7.7 0 0 1-11.3 6.8L4.5 19.5l1.2-4A7.7 7.7 0 1 1 20 11.5z" {...s} />
      );
    case 'check-square':
      return (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={4.5} {...s} />
          <Path d="M8.5 12.2l2.5 2.5 4.7-5.2" {...s} />
        </>
      );
    case 'user':
      return (
        <>
          <Circle cx={12} cy={8.5} r={3.6} {...s} />
          <Path d="M5.5 19.4a6.5 6.5 0 0 1 13 0" {...s} />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx={12} cy={12} r={3.2} {...s} />
          <Path
            d="M12 3.5v2.6M12 17.9v2.6M20.5 12h-2.6M6.1 12H3.5M18 6l-1.8 1.8M7.8 16.2 6 18M18 18l-1.8-1.8M7.8 7.8 6 6"
            {...s}
          />
        </>
      );
    case 'dot':
      return <Circle cx={12} cy={12} r={4} fill={color} />;
    case 'check':
      return <Path d="M5 12.5l4.2 4.2L19 7" {...s} />;
    case 'lock':
      return (
        <>
          <Rect x={5} y={10.5} width={14} height={9.5} rx={3} {...s} />
          <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...s} />
        </>
      );
    case 'sparkles':
      return (
        <>
          <Path d="M12 4l1.7 4.6L18 10l-4.3 1.4L12 16l-1.7-4.6L6 10l4.3-1.4z" {...s} />
          <Path d="M18.5 4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" {...s} />
        </>
      );
  }
}
