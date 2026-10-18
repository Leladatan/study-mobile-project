import { ApiError, ApiErrorCode, isApiError } from './errors';
import { createRequestId, logger, safeRoute, type HttpOutcome } from './logger';

export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.worldbank.org/v2';

export const TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 10000);

export type RequestOptions = {
  signal?: AbortSignal;
  route?: string;
  requestId?: string;
};

function outcomeOf(code: ApiErrorCode): HttpOutcome {
  switch (code) {
    case ApiErrorCode.Http:
      return 'http_error';
    case ApiErrorCode.NotFound:
      return 'not_found';
    case ApiErrorCode.Timeout:
      return 'timeout';
    case ApiErrorCode.Cancel:
      return 'cancel';
    case ApiErrorCode.Parse:
      return 'parse_error';
    default:
      return 'network_error';
  }
}

export async function requestJson(path: string, options: RequestOptions = {}): Promise<unknown> {
  const requestId = options.requestId ?? createRequestId();
  const route = options.route ?? safeRoute(path);
  const method = 'GET';
  const startedAt = Date.now();

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abortListener: (() => void) | undefined;
  let timedOut = false;
  let status: number | null = null;
  let outcome: HttpOutcome = 'success';

  logger.httpStart({ requestId, method, route });

  try {
    if (options.signal?.aborted) {
      throw new ApiError(ApiErrorCode.Cancel, 'Запрос отменён до отправки', { requestId });
    }

    if (options.signal) {
      abortListener = () => controller.abort();
      options.signal.addEventListener('abort', abortListener);
    }

    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    status = response.status;

    if (!response.ok) {
      throw new ApiError(ApiErrorCode.Http, `Сервер ответил ${response.status}`, {
        status: response.status,
        requestId,
      });
    }

    if (response.status === 204) return null;

    const body = await response.text();

    if (body.length === 0) return null;

    try {
      return JSON.parse(body) as unknown;
    } catch (cause) {
      throw new ApiError(ApiErrorCode.Parse, 'Тело ответа не является JSON', {
        status,
        requestId,
        cause,
      });
    }
  } catch (error) {
    const failure = normalize(error, { requestId, status, timedOut, cancelled: options.signal });
    outcome = outcomeOf(failure.code);
    throw failure;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (abortListener && options.signal) {
      options.signal.removeEventListener('abort', abortListener);
    }

    logger.httpEnd({
      requestId,
      method,
      route,
      status,
      durationMs: Date.now() - startedAt,
      outcome,
    });
  }
}

type NormalizeContext = {
  requestId: string;
  status: number | null;
  timedOut: boolean;
  cancelled?: AbortSignal;
};

function normalize(error: unknown, context: NormalizeContext): ApiError {
  if (isApiError(error)) return error;

  const aborted =
    (error instanceof Error && error.name === 'AbortError') || context.cancelled?.aborted === true;

  if (context.timedOut) {
    return new ApiError(ApiErrorCode.Timeout, `Ответ не пришёл за ${TIMEOUT_MS} мс`, {
      status: context.status,
      requestId: context.requestId,
      cause: error,
    });
  }

  if (aborted) {
    return new ApiError(ApiErrorCode.Cancel, 'Запрос отменён', {
      status: context.status,
      requestId: context.requestId,
      cause: error,
    });
  }

  return new ApiError(ApiErrorCode.Network, 'Не удалось связаться с сервером', {
    status: context.status,
    requestId: context.requestId,
    cause: error,
  });
}

export const transportService = { requestJson, baseUrl: BASE_URL, timeoutMs: TIMEOUT_MS };
