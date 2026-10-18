import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { normalizeCountryId } from '../../src/api/countries/countriesApi';
import { TopicScreen } from '../../src/screens/TopicScreen';

export default function TopicRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();

  const id = normalizeCountryId(params.id);

  const goHome = useCallback(() => router.replace('/'), [router]);

  return <TopicScreen id={id} showHomeLink={!router.canGoBack()} onHome={goHome} />;
}
