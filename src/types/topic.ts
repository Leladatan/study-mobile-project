export enum RegionCode {
  EAS = 'EAS',
  ECS = 'ECS',
  LCN = 'LCN',
  MEA = 'MEA',
  NAC = 'NAC',
  SAS = 'SAS',
  SSF = 'SSF',
}

export enum IncomeLevel {
  High = 'High income',
  UpperMiddle = 'Upper middle income',
  LowerMiddle = 'Lower middle income',
  Low = 'Low income',
}

export type Topic = {
  id: string;
  title: string;
  capital: string;
  regionCode: RegionCode;
  regionName: string;
  incomeLevel: IncomeLevel;
  iso2: string;
  imageUrl?: string;
  description?: string;
  population?: number;
  populationYear?: string;
  latitude?: number;
  longitude?: number;
};

export const REGION_NAMES: Record<RegionCode, string> = {
  [RegionCode.EAS]: 'Восточная Азия и Тихий океан',
  [RegionCode.ECS]: 'Европа и Центральная Азия',
  [RegionCode.LCN]: 'Латинская Америка и Карибы',
  [RegionCode.MEA]: 'Ближний Восток и Северная Африка',
  [RegionCode.NAC]: 'Северная Америка',
  [RegionCode.SAS]: 'Южная Азия',
  [RegionCode.SSF]: 'Африка южнее Сахары',
};

export const INCOME_NAMES: Record<IncomeLevel, string> = {
  [IncomeLevel.High]: 'Высокий доход',
  [IncomeLevel.UpperMiddle]: 'Доход выше среднего',
  [IncomeLevel.LowerMiddle]: 'Доход ниже среднего',
  [IncomeLevel.Low]: 'Низкий доход',
};

const REGION_CODES = new Set<string>(Object.values(RegionCode));

const INCOME_VALUES = new Set<string>(Object.values(IncomeLevel));

export function toRegionCode(value: string): RegionCode | null {
  return REGION_CODES.has(value) ? (value as RegionCode) : null;
}

export function toIncomeLevel(value: string): IncomeLevel | null {
  return INCOME_VALUES.has(value) ? (value as IncomeLevel) : null;
}
