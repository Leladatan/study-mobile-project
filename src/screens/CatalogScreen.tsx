import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RegionFilter } from '../components/RegionFilter';
import { SearchField } from '../components/SearchField';
import { TopicCard } from '../components/TopicCard';
import { DEMO_NOTE } from '../data/fixtures';
import { useCatalog } from '../hooks/useCatalog';
import { describeApiError } from '../shared/api/errors';
import { colors, radius, spacing } from '../theme';
import type { Topic } from '../types/topic';

export type CatalogScreenProps = {
  onOpen: (id: Topic['id']) => void;
};

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
    error,
    hasMore,
    loadMore,
    loadAll,
    loadingMore,
    moreError,
    retry,
    source,
    useDemoData,
    useNetworkData,
    selectedCount,
    isSelected,
    toggleSelection,
    clearSelection,
    resetFilters,
    filtersActive,
  } = useCatalog();

  const renderItem = useCallback<ListRenderItem<Topic>>(
    ({ item }) => (
      <TopicCard
        topic={item}
        onPress={onOpen}
        onLongPress={toggleSelection}
        selected={isSelected(item.id)}
      />
    ),
    [onOpen, toggleSelection, isSelected],
  );

  const keyExtractor = useCallback((item: Topic) => item.id, []);

  const scrolled = useRef(false);

  const handleScroll = useCallback(() => {
    scrolled.current = true;
  }, []);

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

      {source === 'demo' ? (
        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Демо-данные</Text>
          <Text style={styles.demoText}>{DEMO_NOTE}</Text>
          <Pressable onPress={useNetworkData} accessibilityRole="button" hitSlop={6}>
            <Text style={styles.demoAction}>Вернуться к сети</Text>
          </Pressable>
        </View>
      ) : null}

      <SearchField value={query} onChange={setQuery} />

      <RegionFilter regions={regions} selected={regionCode} onSelect={setRegionCode} />

      <View style={styles.statusRow}>
        <Text style={styles.counter}>
          {searchActive
            ? `Найдено ${visibleTopics.length} из ${loadedCount}`
            : `${loadedCount} карточек`}
        </Text>

        <View style={styles.actions}>
          <Text style={styles.selectedCount}>Выбрано: {selectedCount}</Text>
          {selectedCount > 0 ? (
            <Pressable onPress={clearSelection} hitSlop={8} accessibilityRole="button">
              <Text style={styles.action}>снять</Text>
            </Pressable>
          ) : null}
          {filtersActive ? (
            <Pressable onPress={resetFilters} hitSlop={8} accessibilityRole="button">
              <Text style={styles.action}>сбросить</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {searchActive && hasMore ? (
        <Pressable onPress={loadAll} accessibilityRole="button" style={styles.hint}>
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
          <Text style={styles.stateText}>{describeApiError(error)}</Text>
          <Pressable onPress={retry} accessibilityRole="button" style={styles.primaryButton}>
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
          <Pressable onPress={loadAll} accessibilityRole="button" style={styles.primaryButton}>
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
          <Text style={styles.footerText}>{describeApiError(moreError)}</Text>
          <Pressable onPress={loadMore} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.action}>Повторить загрузку</Text>
          </Pressable>
        </View>
      );
    }

    if (hasMore) {
      return (
        <View style={styles.footer}>
          <Pressable onPress={loadMore} accessibilityRole="button" hitSlop={8}>
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
      data={visibleTopics}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={footer}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={styles.content}
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
    paddingBottom: spacing.xxl,
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
