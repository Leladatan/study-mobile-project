import { createContext, useContext, type ReactNode } from 'react';
import { useCatalog } from './useCatalog';

export type CatalogValue = ReturnType<typeof useCatalog>;

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();

  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalogState(): CatalogValue {
  const value = useContext(CatalogContext);

  if (value === null) {
    throw new Error('useCatalogState вызван вне CatalogProvider');
  }

  return value;
}
