export enum ApiErrorCode {
  Http = 'http_error',
  NotFound = 'not_found',
  InvalidId = 'invalid_id',
  Network = 'network_error',
  Timeout = 'timeout',
  Cancel = 'cancel',
  Parse = 'parse_error',
  Contract = 'contract_error',
}

export type ApiErrorOptions = {
  status?: number | null;
  requestId?: string;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly isApiError = true;
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly requestId: string;
  readonly reason: unknown;

  constructor(code: ApiErrorCode, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = options.status ?? null;
    this.requestId = options.requestId ?? '';
    this.reason = options.cause;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { isApiError?: unknown }).isApiError === true
  );
}

export function isCancel(value: unknown): boolean {
  return isApiError(value) && value.code === ApiErrorCode.Cancel;
}

export function describeApiError(error: unknown): string {
  if (!isApiError(error)) return 'Неизвестная ошибка.';

  switch (error.code) {
    case ApiErrorCode.Http:
      return `Сервер ответил ошибкой ${error.status ?? '—'}.`;
    case ApiErrorCode.NotFound:
      return 'Такой записи нет в справочнике.';
    case ApiErrorCode.InvalidId:
      return 'Неверный формат кода страны.';
    case ApiErrorCode.Network:
      return 'Нет связи с сервером. Проверьте интернет.';
    case ApiErrorCode.Timeout:
      return 'Сервер не ответил вовремя.';
    case ApiErrorCode.Cancel:
      return 'Запрос отменён.';
    case ApiErrorCode.Parse:
      return 'Ответ сервера не удалось разобрать.';
    case ApiErrorCode.Contract:
      return 'Ответ сервера не совпал с ожидаемым форматом.';
  }
}
