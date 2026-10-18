import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { CatalogScreen } from '../../src/screens/CatalogScreen';
import type { Topic } from '../../src/types/topic';

export default function CatalogRoute() {
  const router = useRouter();

  const open = useCallback(
    (id: Topic['id']) => router.push({ pathname: '/topic/[id]', params: { id } }),
    [router],
  );

  return <CatalogScreen onOpen={open} />;
}
