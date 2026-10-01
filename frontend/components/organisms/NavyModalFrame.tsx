/**
 * `<NavyModalFrame>` — обёртка брендовых навy full-bleed модалок (PAYWALL /
 * PLAN_SELECTION / PAYMENT_FLOW). На native `flex:1` внутри экрана уже
 * растягивается точно на размер телефона — ничего не оборачиваем.
 *
 * На вебе `app/_layout.tsx.frame` — `{flex:1, width:'100%'}`, без потолка
 * по высоте (`docs/design-tokens.md` §«Веб-контейнер»: полноширинный режим
 * — намеренное решение Фазы 5/7). Для обычных theme-aware экранов это
 * нормально. Но эти три экрана — короткий контент на голом `navy.deep` вне
 * темы — в высоком окне браузера превращается в трёхэтажный пустой чёрный
 * провал между контентом и кнопкой. Реального «свайп на весь экран телефона»
 * тут нет и не будет на вебе — поэтому вместо растягивания ограничиваем
 * карточку размером телефона (390×844, тот же размер, что и в
 * `docs/source/design-reference.html` — исходный прототип буквально рисовал
 * себя в рамке ровно этих габаритов) и центрируем в окне тем же цветом
 * фона, чтобы леттербоксинг не был заметен как шов.
 */

import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

const MAX_WIDTH = 430;
const MAX_HEIGHT = 900;

interface Props {
  children: ReactNode;
  backgroundColor: string;
}

export function NavyModalFrame({ children, backgroundColor }: Props) {
  if (Platform.OS !== 'web') return <>{children}</>;

  return (
    <View style={[styles.outer, { backgroundColor }]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inner: { width: '100%', maxWidth: MAX_WIDTH, height: '100%', maxHeight: MAX_HEIGHT },
});
