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
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { favoriteDemoService } from '../features/favorites/api/favoriteDemoService';
import { toggleFavorite } from '../features/favorites/model/favoriteCommand';
import {
  selectFavoriteError,
  selectIsFavorite,
  selectIsFavoritePending,
} from '../features/favorites/model/selectors';
import { useTopic } from '../hooks/useTopic';
import { formatPopulation } from '../lib/format';
import { describeApiError } from '../shared/api/errors';
import { colors, radius, spacing } from '../theme';
import { INCOME_NAMES, type Topic } from '../types/topic';

export type TopicScreenProps = {
  id: string | undefined;
  showHomeLink?: boolean;
  onHome: () => void;
};

export function TopicScreen({ id, showHomeLink = false, onHome }: TopicScreenProps) {
  const { topic, status, error, retry } = useTopic(id);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {showHomeLink ? (
        <Pressable onPress={onHome} accessibilityRole="button" hitSlop={8} style={styles.back}>
          <Text style={styles.backText}>‹ В каталог</Text>
        </Pressable>
      ) : null}

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
          <Pressable onPress={onHome} accessibilityRole="button" hitSlop={8}>
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
  const dispatch = useAppDispatch();
  const favorite = useAppSelector((state) => selectIsFavorite(state, topic.id));
  const pending = useAppSelector((state) => selectIsFavoritePending(state, topic.id));
  const errorMessage = useAppSelector((state) => selectFavoriteError(state, topic.id));

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

      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{topic.title}</Text>
          <Text style={styles.code}>
            {topic.id} · {topic.iso2}
          </Text>
        </View>

        <Pressable
          onPress={pending ? undefined : () => void dispatch(toggleFavorite(topic.id))}
          disabled={pending}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite, disabled: pending }}
          accessibilityLabel={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          style={({ pressed }) => [
            styles.favoriteButton,
            favorite && styles.favoriteButtonActive,
            pending && styles.favoriteButtonPending,
            pressed && !pending && styles.favoriteButtonPressed,
          ]}>
          {pending ? (
            <ActivityIndicator size="small" color={favorite ? colors.surface : colors.accent} />
          ) : (
            <Text style={[styles.favoriteIcon, favorite && styles.favoriteIconActive]}>★</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.serviceNote}>Учебный сервис: без сохранения</Text>

      {errorMessage !== undefined ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {!pending ? (
        <Pressable
          onPress={() => favoriteDemoService.failNext(topic.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ошибка следующего изменения">
          <Text style={styles.failNext}>Ошибка следующего изменения</Text>
        </Pressable>
      ) : null}

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
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
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  favoriteButtonPending: {
    opacity: 0.7,
  },
  favoriteButtonPressed: {
    opacity: 0.5,
  },
  favoriteIcon: {
    fontSize: 20,
    color: colors.textFaint,
  },
  favoriteIconActive: {
    color: colors.surface,
  },
  serviceNote: {
    fontSize: 12,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  failNext: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
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
