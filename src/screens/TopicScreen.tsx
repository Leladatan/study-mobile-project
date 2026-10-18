import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTopic } from '../hooks/useTopic';
import { formatPopulation } from '../lib/format';
import { describeApiError } from '../shared/api/errors';
import { colors, radius, spacing } from '../theme';
import { INCOME_NAMES, type Topic } from '../types/topic';

export type TopicScreenProps = {
  id: string;
  onBack: () => void;
};

export function TopicScreen({ id, onBack }: TopicScreenProps) {
  const { topic, status, error, retry } = useTopic(id);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} accessibilityRole="button" hitSlop={8} style={styles.back}>
        <Text style={styles.backText}>‹ Каталог</Text>
      </Pressable>

      {status === 'loading' ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>Загружаем карточку…</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Карточка не открылась</Text>
          <Text style={styles.stateText}>{describeApiError(error)}</Text>
          <Pressable onPress={retry} accessibilityRole="button" style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Повторить</Text>
          </Pressable>
          <Pressable onPress={onBack} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.action}>Вернуться в каталог</Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'success' && topic !== null ? <TopicDetails topic={topic} /> : null}
    </ScrollView>
  );
}

function TopicDetails({ topic }: { topic: Topic }) {
  const [flagFailed, setFlagFailed] = useState(false);
  const showFlag = topic.imageUrl !== undefined && !flagFailed;

  return (
    <View style={styles.card}>
      {showFlag ? (
        <Image
          source={{ uri: topic.imageUrl }}
          style={styles.flag}
          resizeMode="cover"
          onError={() => setFlagFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[styles.flag, styles.placeholder]}>
          <Text style={styles.placeholderText}>{topic.id}</Text>
        </View>
      )}

      <Text style={styles.title}>{topic.title}</Text>
      <Text style={styles.code}>
        {topic.id} · {topic.iso2}
      </Text>

      {topic.description !== undefined ? (
        <Text style={styles.description}>{topic.description}</Text>
      ) : null}

      <Row label="Столица" value={topic.capital.length > 0 ? topic.capital : 'не указана'} />
      <Row label="Регион" value={topic.regionName} />
      <Row label="Уровень дохода" value={INCOME_NAMES[topic.incomeLevel]} />
      <Row
        label="Население"
        value={
          topic.population === undefined
            ? 'нет данных'
            : `${formatPopulation(topic.population)} чел.${
                topic.populationYear === undefined ? '' : ` (${topic.populationYear})`
              }`
        }
      />
      <Row
        label="Координаты"
        value={
          topic.latitude === undefined || topic.longitude === undefined
            ? 'нет данных'
            : `${topic.latitude}, ${topic.longitude}`
        }
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  flag: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.placeholder,
    marginBottom: spacing.sm,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textFaint,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  code: {
    fontSize: 13,
    color: colors.textFaint,
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  primaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
});
