import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TopicCard } from '../components/TopicCard';
import { TOPICS } from '../data/topics';
import { colors, radius, spacing } from '../theme';
import type { Topic } from '../types/topic';

export function CatalogScreen() {
  const [selected, setSelected] = useState<Topic | null>(null);

  const handlePress = (topic: Topic) => {
    setSelected(topic);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.brand}>WorldDex</Text>
        <Text style={styles.tagline}>Справочник стран мира</Text>
      </View>

      <View style={styles.selection}>
        <Text style={styles.selectionLabel}>Выбранная карточка</Text>
        <Text style={styles.selectionValue}>
          {selected ? `${selected.title} · ${selected.capital}` : 'Нажмите на любую карточку'}
        </Text>
      </View>

      <Text style={styles.counter}>{TOPICS.length} карточек</Text>

      <View style={styles.list}>
        {TOPICS.map((topic, index) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onPress={handlePress}
            featured={index === 0}
          />
        ))}
      </View>

      <Text style={styles.footnote}>
        Sprint 1 — статическая витрина на локальных fixtures. Данные подготовлены по World Bank
        Open Data, флаги — flagcdn.com.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: 2,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
  },
  selection: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  selectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  selectionValue: {
    fontSize: 15,
    color: colors.text,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.textFaint,
    textTransform: 'uppercase',
  },
  list: {
    gap: spacing.md,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
