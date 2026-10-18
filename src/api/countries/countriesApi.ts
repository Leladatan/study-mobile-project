import { ApiError, ApiErrorCode, isApiError } from '../../shared/api/errors';
import { createRequestId, logger } from '../../shared/api/logger';
import { transportService } from '../../shared/api/transportService';
import type { RegionCode, Topic } from '../../types/topic';
import {
  parseCountryPage,
  parsePopulation,
  type CountryPage,
  type PopulationFact,
} from './countryDto';

export const DEFAULT_PAGE_SIZE = 50;

export const FULL_PAGE_SIZE = 400;

export const POPULATION_INDICATOR = 'SP.POP.TOTL';

const COUNTRY_ID = /^[A-Za-z]{3}$/;

export function isValidCountryId(id: string): boolean {
  return COUNTRY_ID.test(id);
}

export function normalizeCountryId(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return undefined;

  const normalized = raw.trim().toUpperCase();
  return isValidCountryId(normalized) ? normalized : undefined;
}

type QueryValue = string | number | undefined;

function query(params: Record<string, QueryValue>): string {
  const parts: string[] = [];

  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === undefined) continue;
    parts.push(`${key}=${encodeURIComponent(String(value))}`);
  }

  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

async function send<T>(
  path: string,
  route: string,
  signal: AbortSignal | undefined,
  parse: (raw: unknown) => T,
): Promise<T> {
  const requestId = createRequestId();
  const raw = await transportService.requestJson(path, { signal, route, requestId });

  try {
    return parse(raw);
  } catch (error) {
    if (isApiError(error) && error.code === ApiErrorCode.Contract) {
      logger.contractError({ requestId, route, field: error.message });
    }
    throw error;
  }
}

export type ListParams = {
  page?: number;
  perPage?: number;
  region?: RegionCode | null;
  signal?: AbortSignal;
};

export const countriesApi = {
  list({ page = 1, perPage = DEFAULT_PAGE_SIZE, region, signal }: ListParams = {}): Promise<CountryPage> {
    const path = `/country${query({
      format: 'json',
      page,
      per_page: perPage,
      region: region ?? undefined,
    })}`;

    return send(path, '/country', signal, parseCountryPage);
  },

  async getById(id: string, signal?: AbortSignal): Promise<Topic> {
    if (!isValidCountryId(id)) {
      throw new ApiError(ApiErrorCode.InvalidId, `Код «${id}» не похож на код страны`);
    }

    const path = `/country/${encodeURIComponent(id)}${query({ format: 'json' })}`;
    const page = await send(path, '/country/:id', signal, parseCountryPage);
    const topic = page.items[0];

    if (topic === undefined) {
      throw new ApiError(ApiErrorCode.NotFound, 'Страна не найдена');
    }

    return topic;
  },

  getPopulation(id: string, signal?: AbortSignal): Promise<PopulationFact | null> {
    if (!isValidCountryId(id)) {
      return Promise.reject(new ApiError(ApiErrorCode.InvalidId, `Код «${id}» не похож на код страны`));
    }

    const path = `/country/${encodeURIComponent(id)}/indicator/${POPULATION_INDICATOR}${query({
      format: 'json',
      per_page: 1,
      mrnev: 1,
    })}`;

    return send(path, '/country/:id/indicator/:indicator', signal, parsePopulation);
  },
};
