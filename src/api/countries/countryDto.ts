import { ApiError, ApiErrorCode } from '../../shared/api/errors';
import {
  REGION_NAMES,
  toIncomeLevel,
  toRegionCode,
  type Topic,
} from '../../types/topic';

export const AGGREGATE_REGION_ID = 'NA';

export type NamedValue = {
  id: string;
  value: string;
};

export type CountryDto = {
  id: string;
  iso2Code: string;
  name: string;
  capitalCity: string;
  region: NamedValue;
  incomeLevel: NamedValue;
  longitude: string;
  latitude: string;
};

export type CountryPage = {
  page: number;
  pages: number;
  total: number;
  items: Topic[];
};

export type PopulationFact = {
  value: number;
  year: string;
};

function contract(field: string): ApiError {
  return new ApiError(ApiErrorCode.Contract, field);
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw contract(field);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw contract(field);
  return value;
}

function asNumber(value: unknown, field: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  throw contract(field);
}

function asNamedValue(value: unknown, field: string): NamedValue {
  const record = asRecord(value, field);
  return {
    id: asString(record.id, `${field}.id`),
    value: asString(record.value, `${field}.value`),
  };
}

function asCoordinate(value: string): number | undefined {
  if (value.trim().length === 0) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function flagUrl(iso2: string): string | undefined {
  if (!/^[A-Za-z]{2}$/.test(iso2)) return undefined;
  return `https://flagcdn.com/w320/${iso2.toLowerCase()}.png`;
}

export function parseCountryDto(value: unknown): CountryDto {
  const record = asRecord(value, 'country');

  const dto: CountryDto = {
    id: asString(record.id, 'country.id'),
    iso2Code: asString(record.iso2Code, 'country.iso2Code'),
    name: asString(record.name, 'country.name'),
    capitalCity: asString(record.capitalCity, 'country.capitalCity'),
    region: asNamedValue(record.region, 'country.region'),
    incomeLevel: asNamedValue(record.incomeLevel, 'country.incomeLevel'),
    longitude: asString(record.longitude, 'country.longitude'),
    latitude: asString(record.latitude, 'country.latitude'),
  };

  if (dto.id.trim().length === 0) throw contract('country.id');
  if (dto.name.trim().length === 0) throw contract('country.name');

  return dto;
}

export function isAggregate(dto: CountryDto): boolean {
  return dto.region.id === AGGREGATE_REGION_ID;
}

export function toTopic(dto: CountryDto): Topic {
  const regionCode = toRegionCode(dto.region.id);
  if (regionCode === null) throw contract('country.region.id');

  const incomeLevel = toIncomeLevel(dto.incomeLevel.value);
  if (incomeLevel === null) throw contract('country.incomeLevel.value');

  return {
    id: dto.id,
    title: dto.name,
    capital: dto.capitalCity,
    regionCode,
    regionName: REGION_NAMES[regionCode],
    incomeLevel,
    iso2: dto.iso2Code,
    imageUrl: flagUrl(dto.iso2Code),
    latitude: asCoordinate(dto.latitude),
    longitude: asCoordinate(dto.longitude),
  };
}

type Envelope = {
  page: number;
  pages: number;
  total: number;
  rows: unknown[];
};

export function parseEnvelope(value: unknown): Envelope {
  if (!Array.isArray(value)) throw contract('response');

  if (value.length === 1) {
    const first = asRecord(value[0], 'response[0]');
    if (Array.isArray(first.message)) {
      throw new ApiError(ApiErrorCode.NotFound, 'Справочник не знает такого кода');
    }
    throw contract('response');
  }

  if (value.length < 2) throw contract('response');

  const meta = asRecord(value[0], 'response.meta');
  const rows = value[1];
  if (!Array.isArray(rows)) throw contract('response.rows');

  return {
    page: asNumber(meta.page, 'meta.page'),
    pages: asNumber(meta.pages, 'meta.pages'),
    total: asNumber(meta.total, 'meta.total'),
    rows,
  };
}

export function parseCountryPage(value: unknown): CountryPage {
  const envelope = parseEnvelope(value);
  const items: Topic[] = [];

  for (const row of envelope.rows) {
    const dto = parseCountryDto(row);
    if (isAggregate(dto)) continue;
    items.push(toTopic(dto));
  }

  return {
    page: envelope.page,
    pages: envelope.pages,
    total: envelope.total,
    items,
  };
}

export function parsePopulation(value: unknown): PopulationFact | null {
  const envelope = parseEnvelope(value);
  const first = envelope.rows[0];
  if (first === undefined) return null;

  const record = asRecord(first, 'indicator[0]');
  if (record.value === null || record.value === undefined) return null;

  return {
    value: asNumber(record.value, 'indicator[0].value'),
    year: asString(record.date, 'indicator[0].date'),
  };
}
