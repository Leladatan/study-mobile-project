import { memo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPopulation } from '../lib/format';
import { colors, radius, spacing } from '../theme';
import { INCOME_NAMES, type Topic } from '../types/topic';

export type TopicCardProps = {
  topic: Topic;
  onPress: (id: Topic['id']) => void;
  onToggleFavorite?: (id: Topic['id']) => void;
  onFailNext?: (id: Topic['id']) => void;
  featured?: boolean;
  favorite?: boolean;
  pending?: boolean;
  errorMessage?: string;
};

function TopicCardView({
  topic,
  onPress,
  onToggleFavorite,
  onFailNext,
  featured = false,
  favorite = false,
  pending = false,
  errorMessage,
}: TopicCardProps) {
  const [flagFailed, setFlagFailed] = useState(false);
  const showFlag = topic.imageUrl !== undefined && !flagFailed;
  const toggleDisabled = onToggleFavorite === undefined || pending;

  return (
    <Pressable
      onPress={() => onPress(topic.id)}
      accessibilityRole="button"
      accessibilityState={{ selected: favorite }}
      accessibilityLabel={`${topic.title}, столица ${topic.capital || 'не указана'}`}
      style={({ pressed }) => [
        styles.card,
        featured && styles.cardFeatured,
        favorite && styles.cardFavorite,
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.row}>
        {showFlag ? (
          <Image
            source={{ uri: topic.imageUrl }}
            style={[styles.flag, featured && styles.flagFeatured]}
            resizeMode="cover"
            onError={() => setFlagFailed(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.flag, styles.placeholder, featured && styles.flagFeatured]}>
            <Text style={styles.placeholderText}>{topic.id}</Text>
          </View>
        )}

        <View style={styles.head}>
          <Text style={[styles.title, featured && styles.titleFeatured]} numberOfLines={1}>
            {topic.title}
          </Text>
          <Text style={styles.capital} numberOfLines={1}>
            {topic.capital.length > 0 ? topic.capital : 'Столица не указана'}
          </Text>
        </View>

        <Pressable
          onPress={toggleDisabled ? undefined : () => onToggleFavorite(topic.id)}
          disabled={toggleDisabled}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite, disabled: toggleDisabled }}
          accessibilityLabel={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          style={({ pressed }) => [
            styles.mark,
            favorite && styles.markActive,
            pending && styles.markPending,
            pressed && !toggleDisabled && styles.markPressed,
          ]}>
          {pending ? (
            <ActivityIndicator size="small" color={favorite ? colors.surface : colors.accent} />
          ) : (
            <Text style={[styles.markIcon, favorite && styles.markIconActive]}>★</Text>
          )}
        </Pressable>
      </View>

      {topic.description !== undefined ? (
        <Text style={styles.description} numberOfLines={featured ? 4 : 2}>
          {topic.description}
        </Text>
      ) : null}

      <View style={styles.meta}>
        <View style={styles.tag}>
          <Text style={styles.tagText} numberOfLines={1}>
            {topic.regionName}
          </Text>
        </View>
        <Text style={styles.population} numberOfLines={1}>
          {topic.population !== undefined
            ? `${formatPopulation(topic.population)} чел. · ${topic.populationYear ?? ''}`.trim()
            : INCOME_NAMES[topic.incomeLevel]}
        </Text>
      </View>

      {errorMessage !== undefined ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {onFailNext !== undefined && !pending ? (
        <Pressable
          onPress={() => onFailNext(topic.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ошибка следующего изменения">
          <Text style={styles.failNext}>Ошибка следующего изменения</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export const TopicCard = memo(TopicCardView);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardFeatured: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cardFavorite: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  cardPressed: {
    opacity: 0.6,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  markPending: {
    opacity: 0.7,
  },
  markPressed: {
    opacity: 0.5,
  },
  markIcon: {
    fontSize: 16,
    lineHeight: 18,
    color: colors.textFaint,
  },
  markIconActive: {
    color: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flag: {
    width: 56,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.placeholder,
  },
  flagFeatured: {
    width: 72,
    height: 48,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textFaint,
  },
  head: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  titleFeatured: {
    fontSize: 21,
  },
  capital: {
    fontSize: 13,
    color: colors.textMuted,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tag: {
    flexShrink: 1,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  population: {
    fontSize: 12,
    color: colors.textFaint,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#B91C1C',
  },
  failNext: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
