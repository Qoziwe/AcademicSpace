/**
 * `<FocusSoundTile>` — плитка фонового звука на экране FOCUS_TOOLS
 * (`design-reference.html:796`, `sounds`). Экран FOCUS сознательно вне темы
 * (фиксированный навy `navy.deep`) — цвета не из палитры.
 *
 * У активной плитки бары эквалайзера пульсируют — `<Pulse>` с длительностью
 * `700 + i*130` мс (`design-reference.html:1511`).
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Pulse } from '@/components/motion';
import { bodyFont, radius } from '@/theme';

const BAR_HEIGHTS = [8, 15, 11, 18, 7]; // ref: design-reference.html sounds bars

interface Props {
  name: string;
  sub: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FocusSoundTile({ name, sub, active, onPress, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: active ? 'rgba(124,147,255,0.22)' : 'rgba(255,255,255,0.06)',
          borderColor: active ? 'rgba(124,147,255,0.5)' : 'transparent',
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <View style={styles.bars}>
        {BAR_HEIGHTS.map((h, i) => {
          const barStyle = {
            width: 3,
            borderRadius: 2,
            height: h,
            backgroundColor: active ? '#B6C4FF' : 'rgba(255,255,255,0.3)',
          } as const;
          return active ? (
            <Pulse key={i} durationMs={700 + i * 130} style={barStyle} />
          ) : (
            <View key={i} style={barStyle} />
          );
        })}
      </View>
      <Text
        style={[
          bodyFont('700'),
          styles.name,
          { color: active ? '#FFFFFF' : 'rgba(255,255,255,0.8)' },
        ]}
      >
        {name}
      </Text>
      <Text style={[bodyFont('500'), styles.sub]}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 15,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2.5,
    height: 18,
  },
  name: { fontSize: 12.5, marginTop: 11 },
  sub: { fontSize: 10.5, marginTop: 2, color: 'rgba(255,255,255,0.4)' },
});
