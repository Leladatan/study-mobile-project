import { useCallback, useEffect, useMemo, useState } from 'react';
import { TOPICS } from '../data/topics';
import { REGION_NAMES, RegionCode, type Topic } from '../types/topic';

const SEARCH_DELAY = 250;

export type RegionOption = {
  code: RegionCode;
  label: string;
};

const REGION_OPTIONS: RegionOption[] = Object.values(RegionCode)
  .filter((code) => TOPICS.some((topic) => topic.regionCode === code))
  .map((code) => ({ code, label: REGION_NAMES[code] }))
  .sort((a, b) => a.label.localeCompare(b.label, 'ru'));

const SEARCH_INDEX = TOPICS.map((topic) => ({
  topic,
  title: topic.title.toLowerCase(),
  capital: topic.capital.toLowerCase(),
}));

const EMPTY_SELECTION: ReadonlySet<string> = new Set();

export function useCatalog() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [regionCode, setRegionCode] = useState<RegionCode | null>(null);
  const [selectedIds, setSelectedIds] = useState(EMPTY_SELECTION);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  const visibleTopics = useMemo<Topic[]>(() => {
    const needle = appliedQuery.trim().toLowerCase();
    if (needle.length === 0 && regionCode === null) return TOPICS;
    return SEARCH_INDEX.filter(
      (entry) =>
        (regionCode === null || entry.topic.regionCode === regionCode) &&
        (needle.length === 0 || entry.title.includes(needle) || entry.capital.includes(needle)),
    ).map((entry) => entry.topic);
  }, [appliedQuery, regionCode]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(EMPTY_SELECTION), []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setAppliedQuery('');
    setRegionCode(null);
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const filtersActive = query.trim().length > 0 || regionCode !== null;

  return {
    query,
    setQuery,
    appliedQuery,
    regionCode,
    setRegionCode,
    regions: REGION_OPTIONS,
    visibleTopics,
    totalCount: TOPICS.length,
    selectedCount: selectedIds.size,
    isSelected,
    toggleSelection,
    clearSelection,
    resetFilters,
    filtersActive,
  };
}
