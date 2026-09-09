import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPopulation } from '../lib/format';
import { colors, radius, spacing } from '../theme';
import { INCOME_NAMES, type Topic } from '../types/topic';

export type TopicCardProps = {
  topic: Topic;
  onPress: (topic: Topic) => void;
  featured?: boolean;
};

export function TopicCard({ topic, onPress, featured = false }: TopicCardProps) {
  return (
    <Pressable
      onPress={() => onPress(topic)}
      accessibilityRole="button"
      accessibilityLabel={`${topic.title}, столица ${topic.capital}`}
      style={({ pressed }) => [
        styles.card,
        featured && styles.cardFeatured,
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.row}>
        {topic.imageUrl ? (
          <Image
            source={{ uri: topic.imageUrl }}
            style={[styles.flag, featured && styles.flagFeatured]}
            resizeMode="cover"
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
            {topic.capital}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={featured ? 4 : 2}>
        {topic.description}
      </Text>

      <View style={styles.meta}>
        <View style={styles.tag}>
          <Text style={styles.tagText} numberOfLines={1}>
            {topic.regionName}
          </Text>
        </View>
        <Text style={styles.population}>
          {formatPopulation(topic.population)} чел. · {topic.populationYear}
        </Text>
      </View>

      {featured ? (
        <Text style={styles.income}>{INCOME_NAMES[topic.incomeLevel]}</Text>
      ) : null}
    </Pressable>
  );
}

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
  cardPressed: {
    opacity: 0.6,
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
  income: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
