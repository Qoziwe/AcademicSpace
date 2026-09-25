import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconTile, TextField } from '@/components/atoms';
import { HeaderBar } from '@/components/organisms';
import { useCreateFlashcardDeck } from '@/hooks/api/useFlashcards';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, navy, radius, spacing } from '@/theme';

/** Максимум фото за раз — тот же лимит слотов, что был у мок file-picker'а. */
const MAX_IMAGES = 4;

/**
 * FLASHCARDS_CREATE (`/flashcards/create`). Единый композер, как в чате с
 * ИИ-ментором: текст и фото — не взаимоисключающие вкладки, а один инпут —
 * можно описать тему словами, приложить фото конспекта (реальный
 * `expo-image-picker`, до `MAX_IMAGES` штук) или и то, и другое сразу.
 * `source` для строки в списке колод — вычисляется: есть фото → `image`,
 * иначе `text`. Генерация (`useCreateFlashcardDeck`) — экран сам дожидается
 * результата и уводит на конкретную колоду; GENERATING между ними чисто
 * декоративный (id колоды известен только после ответа).
 */
function FlashcardsCreateScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const create = useCreateFlashcardDeck();

  const attachedCount = images.length;
  const canAttachMore = attachedCount < MAX_IMAGES;

  const addPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - attachedCount,
    });
    if (result.canceled) return;

    setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_IMAGES));
  };
  const removePhoto = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const canSubmit = text.trim().length > 0 || attachedCount > 0;

  const submit = async () => {
    if (!canSubmit || create.isPending) return;
    const source = attachedCount > 0 ? 'image' : 'text';
    router.push('/flashcards/generating');
    try {
      const deck = await create.mutateAsync({
        source,
        text: text.trim() || undefined,
        images: attachedCount > 0 ? images : undefined,
      });
      router.replace({ pathname: '/flashcards/[deckId]', params: { deckId: deck.id } });
    } catch {
      router.replace('/flashcards');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: palette.screen }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HeaderBar
        title="Новая колода"
        sub="текст, фото — или всё сразу"
        onBack={backOr('/flashcards')}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        <View style={styles.tip}>
          <IconTile size={30} radius={10} tone="blueSoft" background="rgba(243,194,75,0.16)">
            <Icon name="sparkles" size={14} color={accent.gold} strokeWidth={1.7} />
          </IconTile>
          <Text style={[bodyFont('500'), styles.tipText, { color: palette.sub }]}>
            Опишите тему своими словами и приложите фото конспекта — можно и то, и другое сразу.
          </Text>
        </View>

        <TextField
          label="Что разбираем?"
          value={text}
          onChangeText={setText}
          placeholder="Например: не понимаю, как решать квадратные уравнения через дискриминант…"
          multiline
          numberOfLines={5}
        />

        <View style={styles.attachHead}>
          <Text style={[bodyFont('700'), styles.attachLabel, { color: palette.sub }]}>
            ФОТО КОНСПЕКТА
          </Text>
          {attachedCount > 0 ? (
            <Text style={[bodyFont('600'), styles.attachCount, { color: palette.sub }]}>
              {attachedCount} из {MAX_IMAGES}
            </Text>
          ) : null}
        </View>

        <View style={styles.attachRow}>
          {images.map((uri, i) => (
            <View
              key={uri}
              style={[styles.chip, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Image source={{ uri }} style={styles.chipThumb} />
              <Text
                numberOfLines={1}
                style={[bodyFont('600'), styles.chipText, { color: palette.ink }]}
              >
                Фото {i + 1}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Убрать фото"
                hitSlop={8}
                onPress={() => removePhoto(i)}
                style={({ pressed }) => [
                  styles.chipRemove,
                  { backgroundColor: palette.chip, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Icon name="x" size={12} color={palette.sub} strokeWidth={2} />
              </Pressable>
            </View>
          ))}

          {canAttachMore ? (
            <Pressable
              accessibilityRole="button"
              onPress={addPhoto}
              style={({ pressed }) => [
                styles.addChip,
                { borderColor: palette.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Icon name="camera" size={15} color={accent.blue} strokeWidth={1.7} />
              <Text style={[bodyFont('700'), styles.addChipText]}>Добавить фото</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={[bodyFont('500'), styles.note, { color: palette.sub }]}>
          ИИ разберёт материал и соберёт карточки «вопрос → ответ» для повторения — обычно это
          занимает пару секунд.
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: palette.screen, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Pressable accessibilityRole="button" onPress={submit} disabled={!canSubmit}>
          <LinearGradient
            colors={[navy.deep, '#2E6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cta, { opacity: canSubmit ? 1 : 0.5 }]}
          >
            <View style={styles.ctaDiamond} />
            <Text style={[bodyFont('800'), styles.ctaText]}>Сгенерировать карточки</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 14 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: 2 },
  tipText: { flex: 1, fontSize: 11.5, lineHeight: 16 },
  attachHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: -4,
  },
  attachLabel: { fontSize: 10.5, letterSpacing: 0.5 },
  attachCount: { fontSize: 10.5 },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 7,
    paddingHorizontal: 8,
    maxWidth: 190,
  },
  chipThumb: { width: 30, height: 30, borderRadius: 10 },
  chipText: { fontSize: 11.5, flexShrink: 1 },
  chipRemove: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  addChipText: { fontSize: 11.5, color: accent.blue },
  note: { fontSize: 11.5, lineHeight: 17 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  cta: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaDiamond: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#F3C24B',
    transform: [{ rotate: '45deg' }],
  },
  ctaText: { fontSize: 15, color: '#FFFFFF' },
});

export default withGuard(FlashcardsCreateScreen, { auth: true });
