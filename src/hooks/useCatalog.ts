import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiManager } from '../api/apiManager';
import { DEFAULT_PAGE_SIZE, FULL_PAGE_SIZE } from '../api/countries/countriesApi';
import { DEMO_TOPICS } from '../data/fixtures';
import { isApiError, isCancel, type ApiError } from '../shared/api/errors';
import { createRequestGuard } from '../shared/api/requestGuard';
import { REGION_NAMES, RegionCode, type Topic } from '../types/topic';
import { catalogMemory } from './catalogMemory';

const SEARCH_DELAY = 300;

export type CatalogStatus = 'loading' | 'success' | 'error';

export type CatalogSource = 'network' | 'demo';

export type RegionOption = {
  code: RegionCode;
  label: string;
};

const REGION_OPTIONS: RegionOption[] = Object.values(RegionCode)
  .map((code) => ({ code, label: REGION_NAMES[code] }))
  .sort((a, b) => a.label.localeCompare(b.label, 'ru'));

const EMPTY_SELECTION: ReadonlySet<string> = new Set();

function byTitle(a: Topic, b: Topic): number {
  return a.title.localeCompare(b.title, 'en');
}

function mergeById(previous: Topic[], incoming: Topic[]): Topic[] {
  const seen = new Set(previous.map((topic) => topic.id));
  const merged = previous.slice();

  for (const topic of incoming) {
    if (seen.has(topic.id)) continue;
    seen.add(topic.id);
    merged.push(topic);
  }

  return merged.sort(byTitle);
}

function asApiError(value: unknown): ApiError | null {
  return isApiError(value) ? value : null;
}

export function useCatalog() {
  const [query, setQuery] = useState(catalogMemory.query);
  const [appliedQuery, setAppliedQuery] = useState(catalogMemory.query);
  const [regionCode, setRegionCode] = useState<RegionCode | null>(catalogMemory.regionCode);
  const [selectedIds, setSelectedIds] = useState(catalogMemory.selectedIds);

  const [items, setItems] = useState<Topic[]>(catalogMemory.items);
  const [status, setStatus] = useState<CatalogStatus>(
    catalogMemory.loaded ? 'success' : 'loading',
  );
  const [error, setError] = useState<ApiError | null>(null);

  const [page, setPage] = useState(catalogMemory.page);
  const [pages, setPages] = useState(catalogMemory.pages);
  const [total, setTotal] = useState(catalogMemory.total);

  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<ApiError | null>(null);

  const [source, setSource] = useState<CatalogSource>('network');
  const [attempt, setAttempt] = useState(0);
  const [active, setActive] = useState(catalogMemory.loaded);

  const pageGuard = useRef(createRequestGuard());
  const moreGuard = useRef(createRequestGuard());
  const moreController = useRef<AbortController | null>(null);
  const moreInFlight = useRef(false);
  const scrollOffset = useRef(catalogMemory.offset);
  const activated = useRef(catalogMemory.loaded);
  const restored = useRef(catalogMemory.loaded);

  useEffect(() => {
    catalogMemory.query = query;
    catalogMemory.regionCode = regionCode;
    catalogMemory.items = items;
    catalogMemory.page = page;
    catalogMemory.pages = pages;
    catalogMemory.total = total;
    catalogMemory.selectedIds = selectedIds;
    catalogMemory.loaded = source === 'network' && status === 'success';
  });

  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!active) return;

    if (restored.current) {
      restored.current = false;
      return;
    }

    if (source === 'demo') return;

    const controller = new AbortController();
    const token = pageGuard.current.start();

    apiManager.countries
      .list({
        page: 1,
        perPage: DEFAULT_PAGE_SIZE,
        region: regionCode,
        signal: controller.signal,
      })
      .then((result) => {
        if (!pageGuard.current.isCurrent(token)) return;
        setItems(result.items.slice().sort(byTitle));
        setPage(result.page);
        setPages(result.pages);
        setTotal(result.total);
        setStatus('success');
      })
      .catch((failure: unknown) => {
        if (!pageGuard.current.isCurrent(token)) return;
        if (isCancel(failure)) return;
        setError(asApiError(failure));
        setStatus('error');
      });

    return () => controller.abort();
  }, [active, regionCode, source, attempt]);

  const activate = useCallback(() => {
    if (activated.current) return;
    activated.current = true;
    setActive(true);
  }, []);

  const stopPending = useCallback(() => {
    moreGuard.current.drop();
    moreController.current?.abort();
    moreController.current = null;
    moreInFlight.current = false;
  }, []);

  const resetFeed = useCallback(() => {
    stopPending();
    pageGuard.current.drop();
    setLoadingMore(false);
    setMoreError(null);
    setItems([]);
    setPage(1);
    setPages(1);
    setStatus('loading');
    setError(null);
  }, [stopPending]);

  const selectRegion = useCallback(
    (code: RegionCode | null) => {
      if (code === regionCode) return;
      if (source === 'network') resetFeed();
      setRegionCode(code);
    },
    [regionCode, source, resetFeed],
  );

  const rememberOffset = useCallback((offset: number) => {
    scrollOffset.current = offset;
    catalogMemory.offset = offset;
  }, []);

  const retry = useCallback(() => {
    resetFeed();
    setAttempt((value) => value + 1);
  }, [resetFeed]);

  const useDemoData = useCallback(() => {
    stopPending();
    pageGuard.current.drop();
    setLoadingMore(false);
    setMoreError(null);
    setSource('demo');
    setItems(DEMO_TOPICS);
    setPage(1);
    setPages(1);
    setTotal(DEMO_TOPICS.length);
    setStatus('success');
    setError(null);
  }, [stopPending]);

  const useNetworkData = useCallback(() => {
    resetFeed();
    setSource('network');
    setAttempt((value) => value + 1);
  }, [resetFeed]);

  const fetchMore = useCallback(
    (targetPage: number, perPage: number) => {
      if (source === 'demo' || status !== 'success' || moreInFlight.current) return;

      const controller = new AbortController();
      const token = moreGuard.current.start();

      moreController.current = controller;
      moreInFlight.current = true;
      setLoadingMore(true);
      setMoreError(null);

      apiManager.countries
        .list({ page: targetPage, perPage, region: regionCode, signal: controller.signal })
        .then((result) => {
          if (!moreGuard.current.isCurrent(token)) return;
          setItems((previous) => mergeById(previous, result.items));
          setPage(result.page);
          setPages(result.pages);
          setTotal(result.total);
        })
        .catch((failure: unknown) => {
          if (!moreGuard.current.isCurrent(token)) return;
          if (isCancel(failure)) return;
          setMoreError(asApiError(failure));
        })
        .finally(() => {
          if (!moreGuard.current.isCurrent(token)) return;
          moreInFlight.current = false;
          moreController.current = null;
          setLoadingMore(false);
        });
    },
    [source, status, regionCode],
  );

  const hasMore = source === 'network' && status === 'success' && page < pages;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    fetchMore(page + 1, DEFAULT_PAGE_SIZE);
  }, [fetchMore, hasMore, page]);

  const loadAll = useCallback(() => {
    if (!hasMore) return;
    fetchMore(1, FULL_PAGE_SIZE);
  }, [fetchMore, hasMore]);

  const toggleSelection = useCallback((id: Topic['id']) => {
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
    selectRegion(null);
  }, [selectRegion]);

  const isSelected = useCallback((id: Topic['id']) => selectedIds.has(id), [selectedIds]);

  const visibleTopics = useMemo<Topic[]>(() => {
    const needle = appliedQuery.trim().toLowerCase();
    let list = items;

    if (source === 'demo' && regionCode !== null) {
      list = list.filter((topic) => topic.regionCode === regionCode);
    }

    if (needle.length > 0) {
      list = list.filter(
        (topic) =>
          topic.title.toLowerCase().includes(needle) ||
          topic.capital.toLowerCase().includes(needle),
      );
    }

    return list;
  }, [items, appliedQuery, source, regionCode]);

  const searchActive = appliedQuery.trim().length > 0;

  const filtersActive = query.trim().length > 0 || regionCode !== null;

  return {
    query,
    setQuery,
    appliedQuery,
    searchActive,
    regionCode,
    setRegionCode: selectRegion,
    regions: REGION_OPTIONS,

    visibleTopics,
    loadedCount: items.length,
    total,
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

    selectedCount: selectedIds.size,
    isSelected,
    toggleSelection,
    clearSelection,
    resetFilters,
    filtersActive,

    scrollOffset,
    rememberOffset,
    activate,
  };
}
