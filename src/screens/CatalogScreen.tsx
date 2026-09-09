import { useCallback } from 'react';
import { FlatList, type ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
import { RegionFilter } from '../components/RegionFilter';
import { SearchField } from '../components/SearchField';
import { TopicCard } from '../components/TopicCard';
import { useCatalog } from '../hooks/useCatalog';
import { colors, radius, spacing } from '../theme';
import type { Topic } from '../types/topic';

export function CatalogScreen() {
  const {
    query,
    setQuery,
    appliedQuery,
    regionId,
    setRegionId,
    regions,
    visibleTopics,
    totalCount,
    selectedCount,
    isSelected,
    toggleSelection,
    clearSelection,
    resetFilters,
    filtersActive,
  } = useCatalog();

  const renderItem = useCallback<ListRenderItem<Topic>>(
    ({ item, index }) => (
      <TopicCard
        topic={item}
        onPress={toggleSelection}
        featured={index === 0 && !filtersActive}
        selected={isSelected(item)}
      />
    ),
    [toggleSelection, isSelected, filtersActive],
  );

  const keyExtractor = useCallback((item: Topic) => item.id, []);

  const header = (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>WorldDex</Text>
        <Text style={styles.tagline}>Справочник стран мира</Text>
      </View>

      <SearchField value={query} onChange={setQuery} />

      <RegionFilter regions={regions} selected={regionId} onSelect={setRegionId} />

      <View style={styles.statusRow}>
        <Text style={styles.counter}>
          {visibleTopics.length === totalCount
            ? `${totalCount} карточек`
            : `${visibleTopics.length} из ${totalCount}`}
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
              <Text style={styles.action}>сбросить фильтры</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>⌕</Text>
      <Text style={styles.emptyTitle}>Ничего не найдено</Text>
      <Text style={styles.emptyText}>
        {appliedQuery.trim().length > 0
          ? `По запросу «${appliedQuery.trim()}» нет совпадений`
          : 'В выбранном регионе нет карточек'}
        {regionId !== null && appliedQuery.trim().length > 0 ? ' в этом регионе' : ''}.
        Измените запрос или сбросьте фильтры.
      </Text>
      <Pressable onPress={resetFilters} accessibilityRole="button" style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Сбросить фильтры</Text>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      data={visibleTopics}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
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
  separator: {
    height: spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 34,
    color: colors.textFaint,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
});
