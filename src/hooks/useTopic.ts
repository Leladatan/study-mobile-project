import { useCallback, useEffect, useRef, useState } from 'react';
import { apiManager } from '../api/apiManager';
import { ApiError, ApiErrorCode, isApiError, isCancel } from '../shared/api/errors';
import { createRequestGuard } from '../shared/api/requestGuard';
import type { Topic } from '../types/topic';

export type TopicStatus = 'loading' | 'success' | 'error';

const MISSING_ID = new ApiError(ApiErrorCode.InvalidId, 'Код страны не передан');

type Loaded = {
  key: string;
  topic: Topic;
};

type Failed = {
  key: string;
  error: ApiError | null;
};

export function useTopic(id: string | undefined) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState<Failed | null>(null);
  const [attempt, setAttempt] = useState(0);

  const guard = useRef(createRequestGuard());

  const key = id === undefined ? null : `${id}:${attempt}`;

  useEffect(() => {
    if (id === undefined || key === null) return;

    const controller = new AbortController();
    const token = guard.current.start();

    Promise.all([
      apiManager.countries.getById(id, controller.signal),
      apiManager.countries.getPopulation(id, controller.signal).catch(() => null),
    ])
      .then(([topic, population]) => {
        if (!guard.current.isCurrent(token)) return;
        setLoaded({
          key,
          topic:
            population === null
              ? topic
              : { ...topic, population: population.value, populationYear: population.year },
        });
      })
      .catch((failure: unknown) => {
        if (!guard.current.isCurrent(token)) return;
        if (isCancel(failure)) return;
        setFailed({ key, error: isApiError(failure) ? failure : null });
      });

    return () => controller.abort();
  }, [id, key]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (key === null) {
    return { topic: null, status: 'error' as TopicStatus, error: MISSING_ID, retry };
  }

  const status: TopicStatus =
    loaded?.key === key ? 'success' : failed?.key === key ? 'error' : 'loading';

  return {
    topic: loaded?.key === key ? loaded.topic : null,
    status,
    error: failed?.key === key ? failed.error : null,
    retry,
  };
}
