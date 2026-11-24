import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_PAGE_SIZE, FULL_PAGE_SIZE } from '../api/countries/countriesApi';
import { useAppDispatch } from '../app/hooks';
import { DEMO_TOPICS } from '../data/fixtures';
import { catalogApi, useGetTopicsQuery } from '../features/posts/api/catalogApi';
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

export function useCatalog() {
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState(catalogMemory.query);
  const [appliedQuery, setAppliedQuery] = useState(catalogMemory.query);
  const [regionCode, setRegionCode] = useState<RegionCode | null>(catalogMemory.regionCode);

  const [pageArg, setPageArg] = useState(catalogMemory.page);
  const [perPageArg, setPerPageArg] = useState(DEFAULT_PAGE_SIZE);

  const [source, setSource] = useState<CatalogSource>('network');
  const [active, setActive] = useState(catalogMemory.loaded);
  const [demoItems, setDemoItems] = useState<Topic[]>([]);

  const scrollOffset = useRef(catalogMemory.offset);
  const activated = useRef(catalogMemory.loaded);

  const {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    refetch,
  } = useGetTopicsQuery(
    { page: pageArg, perPage: perPageArg, region: regionCode },
    { skip: !active || source !== 'network' },
  );

  const networkItems = data?.items ?? (catalogMemory.loaded ? catalogMemory.items : []);
  const items = source === 'demo' ? demoItems : networkItems;
  const page = source === 'demo' ? 1 : (data?.page ?? catalogMemory.page);
  const pages = source === 'demo' ? 1 : (data?.pages ?? catalogMemory.pages);
  const total = source === 'demo' ? demoItems.length : (data?.total ?? catalogMemory.total);

  const status: CatalogStatus =
    source === 'demo'
      ? 'success'
      : !active
        ? 'loading'
        : isError
          ? 'error'
          : isSuccess || networkItems.length > 0
            ? 'success'
            : isLoading
              ? 'loading'
              : 'loading';

  const errorMessage =
    source === 'network' && isError && error && 'message' in error
      ? error.message
      : null;

  const hasMore = source === 'network' && status === 'success' && page < pages;
  const loadingMore = source === 'network' && isFetching && !isLoading && networkItems.length > 0;
  const moreError =
    source === 'network' && isError && networkItems.length > 0 ? errorMessage : null;

  useEffect(() => {
    catalogMemory.query = query;
    catalogMemory.regionCode = regionCode;
    catalogMemory.items = items;
    catalogMemory.page = page;
    catalogMemory.pages = pages;
    catalogMemory.total = total;
    catalogMemory.loaded = source === 'network' && status === 'success';
  });

  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  const activate = useCallback(() => {
    if (activated.current) return;
    activated.current = true;
    setActive(true);
  }, []);

  const rememberOffset = useCallback((offset: number) => {
    scrollOffset.current = offset;
    catalogMemory.offset = offset;
  }, []);

  const selectRegion = useCallback(
    (code: RegionCode | null) => {
      if (code === regionCode) return;
      setRegionCode(code);
      setPageArg(1);
      setPerPageArg(DEFAULT_PAGE_SIZE);
      if (source === 'network') {
        catalogMemory.items = [];
        catalogMemory.loaded = false;
      }
    },
    [regionCode, source],
  );

  const retry = useCallback(() => {
    setPageArg(1);
    setPerPageArg(DEFAULT_PAGE_SIZE);
    void refetch();
  }, [refetch]);

  const useDemoData = useCallback(() => {
    setSource('demo');
    setDemoItems(DEMO_TOPICS);
  }, []);

  const useNetworkData = useCallback(() => {
    setSource('network');
    setPageArg(1);
    setPerPageArg(DEFAULT_PAGE_SIZE);
    setActive(true);
    activated.current = true;
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPerPageArg(DEFAULT_PAGE_SIZE);
    setPageArg(page + 1);
  }, [hasMore, isFetching, page]);

  const loadAll = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPageArg(1);
    setPerPageArg(FULL_PAGE_SIZE);
  }, [hasMore, isFetching]);

  const resetFilters = useCallback(() => {
    setQuery('');
    setAppliedQuery('');
    selectRegion(null);
  }, [selectRegion]);

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

  const prefetchFullCatalog = useCallback(() => {
    if (source !== 'network') return;
    void dispatch(
      catalogApi.endpoints.getTopics.initiate({
        page: 1,
        perPage: FULL_PAGE_SIZE,
        region: regionCode,
      }),
    );
  }, [dispatch, regionCode, source]);

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
    errorMessage,
    isFetching,

    hasMore,
    loadMore,
    loadAll,
    loadingMore,
    moreError,
    retry,
    prefetchFullCatalog,

    source,
    useDemoData,
    useNetworkData,

    resetFilters,
    filtersActive,

    scrollOffset,
    rememberOffset,
    activate,
  };
}
