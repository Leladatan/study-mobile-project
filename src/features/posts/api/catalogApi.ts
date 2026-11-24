import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiManager } from '../../../api/apiManager';
import {
  DEFAULT_PAGE_SIZE,
  isValidCountryId,
} from '../../../api/countries/countriesApi';
import type { CountryPage } from '../../../api/countries/countryDto';
import { describeApiError, isApiError, isCancel } from '../../../shared/api/errors';
import type { RegionCode, Topic } from '../../../types/topic';

export type ApiErrorBody = {
  message: string;
  code?: string;
};

export type GetTopicsArgs = {
  page?: number;
  perPage?: number;
  region?: RegionCode | null;
};

function toError(failure: unknown): { error: ApiErrorBody } {
  if (isCancel(failure)) {
    return { error: { message: 'Запрос отменён', code: 'cancel' } };
  }

  if (isApiError(failure)) {
    return {
      error: {
        message: describeApiError(failure),
        code: failure.code,
      },
    };
  }

  return { error: { message: 'Не удалось загрузить данные' } };
}

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

function regionKey(region: RegionCode | null | undefined): string {
  return region ?? 'all';
}

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: fakeBaseQuery<ApiErrorBody>(),
  endpoints: (build) => ({
    getTopics: build.query<CountryPage, GetTopicsArgs | void>({
      async queryFn(arg, { signal }) {
        const page = arg?.page ?? 1;
        const perPage = arg?.perPage ?? DEFAULT_PAGE_SIZE;
        const region = arg?.region ?? null;

        try {
          const data = await apiManager.countries.list({
            page,
            perPage,
            region,
            signal,
          });
          return {
            data: {
              ...data,
              items: data.items.slice().sort(byTitle),
            },
          };
        } catch (failure) {
          return toError(failure);
        }
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const region = queryArgs && typeof queryArgs === 'object' ? queryArgs.region : null;
        return `${endpointName}-${regionKey(region ?? null)}`;
      },
      merge: (current, incoming, { arg }) => {
        const page = arg && typeof arg === 'object' ? (arg.page ?? 1) : 1;
        const perPage =
          arg && typeof arg === 'object' ? (arg.perPage ?? DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

        if (page === 1 || perPage >= 400) {
          return {
            ...incoming,
            items: incoming.items.slice().sort(byTitle),
          };
        }

        return {
          page: incoming.page,
          pages: incoming.pages,
          total: incoming.total,
          items: mergeById(current?.items ?? [], incoming.items),
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        const currentPage = currentArg && typeof currentArg === 'object' ? currentArg.page : 1;
        const previousPage =
          previousArg && typeof previousArg === 'object' ? previousArg.page : 1;
        const currentPer =
          currentArg && typeof currentArg === 'object' ? currentArg.perPage : DEFAULT_PAGE_SIZE;
        const previousPer =
          previousArg && typeof previousArg === 'object'
            ? previousArg.perPage
            : DEFAULT_PAGE_SIZE;
        const currentRegion =
          currentArg && typeof currentArg === 'object' ? currentArg.region : null;
        const previousRegion =
          previousArg && typeof previousArg === 'object' ? previousArg.region : null;

        return (
          currentPage !== previousPage ||
          currentPer !== previousPer ||
          currentRegion !== previousRegion
        );
      },
    }),

    getTopicById: build.query<Topic, string>({
      async queryFn(id, { signal }) {
        if (!isValidCountryId(id)) {
          return {
            error: {
              message: 'Неверный формат кода страны.',
              code: 'invalid_id',
            },
          };
        }

        try {
          const [topic, population] = await Promise.all([
            apiManager.countries.getById(id, signal),
            apiManager.countries.getPopulation(id, signal).catch(() => null),
          ]);

          if (population === null) return { data: topic };

          return {
            data: {
              ...topic,
              population: population.value,
              populationYear: population.year,
            },
          };
        } catch (failure) {
          return toError(failure);
        }
      },
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useLazyGetTopicsQuery,
  useGetTopicByIdQuery,
  useLazyGetTopicByIdQuery,
} = catalogApi;
