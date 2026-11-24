import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { RegionFilter } from '../components/RegionFilter';
import { SearchField } from '../components/SearchField';
import { TopicCard } from '../components/TopicCard';
import { DEMO_NOTE } from '../data/fixtures';
import { favoriteDemoService } from '../features/favorites/api/favoriteDemoService';
import { toggleFavorite } from '../features/favorites/model/favoriteCommand';
import {
  selectFavoriteCount,
  selectFavoriteError,
  selectIsFavorite,
  selectIsFavoritePending,
} from '../features/favorites/model/selectors';
import { useCatalogState } from '../hooks/CatalogProvider';
import { colors, radius, spacing, tabBarSpace } from '../theme';
import type { Topic } from '../types/topic';

export type CatalogScreenProps = {
  onOpen: (id: Topic['id']) => void;
};

function CatalogTopicCard({
  topic,
  onOpen,
}: {
  topic: Topic;
  onOpen: (id: Topic['id']) => void;
}) {
  const dispatch = useAppDispatch();
  const favorite = useAppSelector((state) => selectIsFavorite(state, topic.id));
  const pending = useAppSelector((state) => selectIsFavoritePending(state, topic.id));
  const errorMessage = useAppSelector((state) => selectFavoriteError(state, topic.id));

  return (
    <TopicCard
      topic={topic}
      onPress={onOpen}
      onToggleFavorite={(id) => {
        void dispatch(toggleFavorite(id));
      }}
      onFailNext={(id) => favoriteDemoService.failNext(id)}
      favorite={favorite}
      pending={pending}
      errorMessage={errorMessage}
    />
  );
}

export function CatalogScreen({ onOpen }: CatalogScreenProps) {
  const {
    query,
    setQuery,
    appliedQuery,
    searchActive,
    regionCode,
    setRegionCode,
    regions,
    visibleTopics,
    loadedCount,
    status,
    errorMessage,
    hasMore,
    loadMore,
    loadAll,
    loadingMore,
    moreError,
    retry,
    isFetching,
    source,
    useDemoData,
    useNetworkData,
    resetFilters,
    filtersActive,
    scrollOffset,
    rememberOffset,
    activate,
  } = useCatalogState();

  const favoriteCount = useAppSelector(selectFavoriteCount);

  const renderItem = useCallback<ListRenderItem<Topic>>(
    ({ item }) => <CatalogTopicCard topic={item} onOpen={onOpen} />,
    [onOpen],
  );

  const keyExtractor = useCallback((item: Topic) => item.id, []);

  const insets = useSafeAreaInsets();

  const changeQuery = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim().length > 0 && hasMore) loadAll();
    },
    [setQuery, hasMore, loadAll],
  );

  const scrolled = useRef(false);
  const listRef = useRef<FlatList<Topic>>(null);
  const restored = useRef(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrolled.current = true;
      rememberOffset(event.nativeEvent.contentOffset.y);
    },
    [rememberOffset],
  );

  const restoreOffset = useCallback(() => {
    if (restored.current) return;
    const offset = scrollOffset.current;
    if (offset <= 0) return;

    restored.current = true;
    listRef.current?.scrollToOffset({ offset, animated: false });
  }, [scrollOffset]);

  const handleEndReached = useCallback(() => {
    if (!scrolled.current) return;
    if (searchActive) return;
    loadMore();
  }, [loadMore, searchActive]);

  const header = (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>WorldDex</Text>
        <Text style={styles.tagline}>Справочник стран мира</Text>
      </View>

      <View style={styles.serviceNote}>
        <Text style={styles.serviceTitle}>Учебный сервис: без сохранения</Text>
        <Text style={styles.serviceText}>
          Избранное живёт только в текущем запуске. Кнопка «Ошибка следующего изменения» на
          карточке один раз отклоняет подтверждение — для проверки отката.
        </Text>
      </View>

      {source === 'demo' ? (
        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Демо-данные</Text>
          <Text style={styles.demoText}>{DEMO_NOTE}</Text>
          <Pressable onPress={useNetworkData} accessibilityRole="button" hitSlop={6}>
            <Text style={styles.demoAction}>Вернуться к сети</Text>
          </Pressable>
        </View>
      ) : null}

      <SearchField value={query} onChange={changeQuery} />

      <RegionFilter regions={regions} selected={regionCode} onSelect={setRegionCode} />

      <View style={styles.statusRow}>
        <Text style={styles.counter}>
          {searchActive
            ? `Найдено ${visibleTopics.length} из ${loadedCount}`
            : `${loadedCount} карточек`}
        </Text>

        <View style={styles.actions}>
          <Text style={styles.selectedCount}>Избранное: {favoriteCount}</Text>
          {filtersActive ? (
            <Pressable onPress={resetFilters} hitSlop={8} accessibilityRole="button">
              <Text style={styles.action}>сбросить</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {searchActive && loadingMore ? (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Догружаем справочник, чтобы искать по всем записям…</Text>
        </View>
      ) : null}

      {searchActive && hasMore && !loadingMore ? (
        <Pressable
          onPress={loadAll}
          disabled={isFetching}
          accessibilityRole="button"
          style={styles.hint}>
          <Text style={styles.hintText}>
            Поиск идёт по загруженным записям. Нажмите, чтобы загрузить весь справочник.
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const listEmpty = (() => {
    if (status === 'loading') {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>Загружаем справочник…</Text>
        </View>
      );
    }

    if (status === 'error') {
      return (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Не удалось загрузить справочник</Text>
          <Text style={styles.stateText}>{errorMessage ?? 'Неизвестная ошибка.'}</Text>
          <Pressable
            onPress={retry}
            disabled={isFetching}
            accessibilityRole="button"
            style={[styles.primaryButton, isFetching && styles.buttonDisabled]}>
            <Text style={styles.primaryButtonText}>Повторить</Text>
          </Pressable>
          <Pressable onPress={useDemoData} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.action}>Показать демо-данные</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.state}>
        <Text style={styles.stateIcon}>⌕</Text>
        <Text style={styles.stateTitle}>Ничего не найдено</Text>
        <Text style={styles.stateText}>
          {appliedQuery.trim().length > 0
            ? `По запросу «${appliedQuery.trim()}» среди загруженных записей совпадений нет.`
            : 'В выбранном регионе записей нет.'}
        </Text>
        {hasMore ? (
          <Pressable
            onPress={loadAll}
            disabled={isFetching}
            accessibilityRole="button"
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Загрузить весь справочник</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={resetFilters} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.action}>Сбросить условия</Text>
        </Pressable>
      </View>
    );
  })();

  const footer = (() => {
    if (visibleTopics.length === 0) return null;

    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.footerText}>Загружаем ещё…</Text>
        </View>
      );
    }

    if (moreError !== null) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{moreError}</Text>
          <Pressable onPress={loadMore} disabled={isFetching} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.action}>Повторить загрузку</Text>
          </Pressable>
        </View>
      );
    }

    if (hasMore) {
      return (
        <View style={styles.footer}>
          <Pressable onPress={loadMore} disabled={isFetching} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.action}>Показать ещё</Text>
          </Pressable>
        </View>
      );
    }

    if (source === 'network' && !searchActive) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Справочник загружен полностью.</Text>
        </View>
      );
    }

    return null;
  })();

  return (
    <FlatList
      ref={listRef}
      data={visibleTopics}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onLayout={activate}
      onContentSizeChange={restoreOffset}
      ListHeaderComponent={header}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={footer}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: tabBarSpace,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.lg,
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
  serviceNote: {
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  serviceText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  demo: {
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.md,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  demoText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  demoAction: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.textFaint,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  hint: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  separator: {
    height: spacing.md,
  },
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  stateIcon: {
    fontSize: 34,
    color: colors.textFaint,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
