import type { RegionCode, Topic } from '../types/topic';

export type CatalogMemory = {
  query: string;
  regionCode: RegionCode | null;
  items: Topic[];
  page: number;
  pages: number;
  total: number;
  offset: number;
  loaded: boolean;
};

export const catalogMemory: CatalogMemory = {
  query: '',
  regionCode: null,
  items: [],
  page: 1,
  pages: 1,
  total: 0,
  offset: 0,
  loaded: false,
};

export function forgetCatalog(): void {
  catalogMemory.query = '';
  catalogMemory.regionCode = null;
  catalogMemory.items = [];
  catalogMemory.page = 1;
  catalogMemory.pages = 1;
  catalogMemory.total = 0;
  catalogMemory.offset = 0;
  catalogMemory.loaded = false;
}
