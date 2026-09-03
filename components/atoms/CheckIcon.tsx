/**
 * Галочка из `design-reference.html` — тот самый path
 * `M2.5 6.3l2.4 2.4L9.5 3.6` в `viewBox 0 0 12 12` (чек-боксы, отметки
 * фильтров, перки пейвола, экран успешной оплаты). Держим один атом,
 * чтобы обводка совпадала везде.
 */

import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function CheckIcon({ size = 12, color = '#FFFFFF', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M2.5 6.3l2.4 2.4L9.5 3.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
