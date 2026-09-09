export type RegionId = 'EAS' | 'ECS' | 'LCN' | 'MEA' | 'NAC' | 'SAS' | 'SSF';

export type IncomeLevel =
  | 'High income'
  | 'Upper middle income'
  | 'Lower middle income'
  | 'Low income';

export type Topic = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  capital: string;
  regionId: RegionId;
  regionName: string;
  incomeLevel: IncomeLevel;
  population: number;
  populationYear: string;
  iso2: string;
};

export const REGION_NAMES: Record<RegionId, string> = {
  EAS: 'Восточная Азия и Тихий океан',
  ECS: 'Европа и Центральная Азия',
  LCN: 'Латинская Америка и Карибы',
  MEA: 'Ближний Восток и Северная Африка',
  NAC: 'Северная Америка',
  SAS: 'Южная Азия',
  SSF: 'Африка южнее Сахары',
};

export const INCOME_NAMES: Record<IncomeLevel, string> = {
  'High income': 'Высокий доход',
  'Upper middle income': 'Доход выше среднего',
  'Lower middle income': 'Доход ниже среднего',
  'Low income': 'Низкий доход',
};
