import { countriesApi } from './countries/countriesApi';

export const apiManager = {
  countries: countriesApi,
};

export type ApiManager = typeof apiManager;
