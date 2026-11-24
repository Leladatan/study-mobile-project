import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { TopicCard } from '../../../components/TopicCard';
import { FULL_PAGE_SIZE } from '../../../api/countries/countriesApi';
import { colors, radius, spacing, tabBarSpace } from '../../../theme';
import type { Topic } from '../../../types/topic';
import { favoriteDemoService } from '../api/favoriteDemoService';
import { toggleFavorite } from '../model/favoriteCommand';
import {
  selectFavoriteCount,
  selectFavoriteErrorEntries,
  selectFavoriteListItems,
  selectFavoritePendingEntries,
  selectIsFavorite,
  selectIsFavoritePending,
  type FavoriteListItem,
} from '../model/selectors';
import { useGetTopicByIdQuery, useGetTopicsQuery } from '../../posts/api/catalogApi';

function MissingFavoriteRow({
  id,
  onOpen,
  onRemove,
}: {
  id: string;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { isFetching, isError, error, refetch } = useGetTopicByIdQuery(id);
  const pending = useAppSelector((state) => selectIsFavoritePending(state, id));
  const errorMessage = useAppSelector((state) =>
    state.favorites.errors[id],
  );

  return (
    <View style={styles.missingCard}>
      <Text style={styles.missingTitle}>{id}</Text>
      <Text style={styles.missingText}>Данные недоступны</Text>
      {errorMessage !== undefined ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {isError && error && 'message' in error ? (
        <Text style={styles.errorText}>{error.message}</Text>
      ) : null}
      <View style={styles.missingActions}>
        <Pressable
          onPress={() => void refetch()}
          disabled={isFetching}
          accessibilityRole="button"
          style={styles.secondaryButton}>
          {isFetching ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Text style={styles.secondaryButtonText}>Повторить</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => onOpen(id)}
          accessibilityRole="button"
          hitSlop={8}>
          <Text style={styles.action}>Открыть карточку</Text>
        </Pressable>
        <Pressable
          onPress={pending ? undefined : () => onRemove(id)}
          disabled={pending}
          accessibilityRole="button"
          accessibilityState={{ disabled: pending }}
          accessibilityLabel="Убрать из избранного"
          hitSlop={8}>
          <Text style={styles.action}>Убрать</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FavoriteRow({
  item,
  onOpen,
  onToggle,
}: {
  item: FavoriteListItem;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const favorite = useAppSelector((state) => selectIsFavorite(state, item.id));
  const pending = useAppSelector((state) => selectIsFavoritePending(state, item.id));
  const errorMessage = useAppSelector((state) => state.favorites.errors[item.id]);

  if (item.topic === null) {
    return <MissingFavoriteRow id={item.id} onOpen={onOpen} onRemove={onToggle} />;
  }

  return (
    <TopicCard
      topic={item.topic}
      onPress={onOpen}
      onToggleFavorite={onToggle}
      onFailNext={(id) => favoriteDemoService.failNext(id)}
      favorite={favorite}
      pending={pending}
      errorMessage={errorMessage}
    />
  );
}

export function FavoritesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const items = useAppSelector(selectFavoriteListItems);
  const count = useAppSelector(selectFavoriteCount);
  const pendingEntries = useAppSelector(selectFavoritePendingEntries);
  const errorEntries = useAppSelector(selectFavoriteErrorEntries);

  useGetTopicsQuery(
    { page: 1, perPage: FULL_PAGE_SIZE },
    { skip: count === 0 },
  );

  const visibleItems = items.filter((item) => {
    const pendingRemove = pendingEntries.some(
      (entry) => entry.id === item.id && entry.previous === true,
    );
    return !pendingRemove;
  });

  const bannerErrors = errorEntries.filter(
    (entry) => !visibleItems.some((item) => item.id === entry.id),
  );

  const bannerPending = pendingEntries.filter(
    (entry) => entry.previous === true && !visibleItems.some((item) => item.id === entry.id),
  );

  const open = useCallback(
    (id: Topic['id']) => router.push({ pathname: '/topic/[id]', params: { id } }),
    [router],
  );

  const toggle = useCallback(
    (id: string) => {
      void dispatch(toggleFavorite(id));
    },
    [dispatch],
  );

  const goCatalog = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderItem = useCallback<ListRenderItem<FavoriteListItem>>(
    ({ item }) => <FavoriteRow item={item} onOpen={open} onToggle={toggle} />,
    [open, toggle],
  );

  const isTrulyEmpty = count === 0 && pendingEntries.length === 0;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Избранное</Text>
      <Text style={styles.subtitle}>Учебный сервис: без сохранения · {count}</Text>

      {bannerPending.length > 0 ? (
        <View style={styles.banner}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.bannerText}>
            Удаляем {bannerPending.map((entry) => entry.id).join(', ')}…
          </Text>
        </View>
      ) : null}

      {bannerErrors.map((entry) => (
        <View key={entry.id} style={styles.errorBanner}>
          <Text style={styles.errorText}>
            {entry.id}: {entry.message}
          </Text>
          <Pressable
            onPress={() => toggle(entry.id)}
            accessibilityRole="button"
            hitSlop={8}>
            <Text style={styles.action}>Повторить</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );

  if (isTrulyEmpty) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + spacing.lg }]}>
        {header}
        <Text style={styles.emptyIcon}>★</Text>
        <Text style={styles.emptyTitle}>Избранное пусто</Text>
        <Text style={styles.emptyText}>
          Отметьте страны звёздочкой в каталоге — они появятся здесь до перезапуска приложения.
        </Text>
        <Pressable onPress={goCatalog} accessibilityRole="button" style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>В каталог</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={visibleItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: tabBarSpace,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
  },
  errorBanner: {
    gap: spacing.xs,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIcon: {
    marginTop: spacing.xxl,
    fontSize: 40,
    color: colors.textFaint,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: spacing.md,
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
  missingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  missingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  missingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  missingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 96,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
});
