import { useCallback, useEffect, useMemo, useState } from 'react';
import { TOPICS } from '../data/topics';
import { REGION_NAMES, type RegionId, type Topic } from '../types/topic';

const SEARCH_DELAY = 250;

export type RegionOption = {
  id: RegionId;
  label: string;
};

export function useCatalog() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [regionId, setRegionId] = useState<RegionId | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  const regions = useMemo<RegionOption[]>(() => {
    const present = new Set<RegionId>();
    for (const topic of TOPICS) present.add(topic.regionId);
    return [...present]
      .map((id) => ({ id, label: REGION_NAMES[id] }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, []);

  const visibleTopics = useMemo<Topic[]>(() => {
    const needle = appliedQuery.trim().toLowerCase();
    return TOPICS.filter((topic) => {
      if (regionId !== null && topic.regionId !== regionId) return false;
      if (needle.length === 0) return true;
      return (
        topic.title.toLowerCase().includes(needle) ||
        topic.capital.toLowerCase().includes(needle)
      );
    });
  }, [appliedQuery, regionId]);

  const toggleSelection = useCallback((topic: Topic) => {
    setSelectedIds((previous) =>
      previous.includes(topic.id)
        ? previous.filter((id) => id !== topic.id)
        : [...previous, topic.id],
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setAppliedQuery('');
    setRegionId(null);
  }, []);

  const isSelected = useCallback(
    (topic: Topic) => selectedIds.includes(topic.id),
    [selectedIds],
  );

  const filtersActive = query.trim().length > 0 || regionId !== null;

  return {
    query,
    setQuery,
    appliedQuery,
    regionId,
    setRegionId,
    regions,
    visibleTopics,
    totalCount: TOPICS.length,
    selectedIds,
    selectedCount: selectedIds.length,
    isSelected,
    toggleSelection,
    clearSelection,
    resetFilters,
    filtersActive,
  };
}
