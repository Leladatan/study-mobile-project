import { ApiError, ApiErrorCode } from '../shared/api/errors';
import { useGetTopicByIdQuery } from '../features/posts/api/catalogApi';
import type { Topic } from '../types/topic';

export type TopicStatus = 'loading' | 'success' | 'error';

const MISSING_ID = new ApiError(ApiErrorCode.InvalidId, 'Код страны не передан');

export function useTopic(id: string | undefined) {
  const skip = id === undefined;
  const { data, error, isLoading, isError, isSuccess, refetch } = useGetTopicByIdQuery(id ?? '', {
    skip,
  });

  if (id === undefined) {
    return {
      topic: null as Topic | null,
      status: 'error' as TopicStatus,
      error: MISSING_ID,
      errorMessage: MISSING_ID.message,
      retry: () => undefined,
    };
  }

  const status: TopicStatus = isSuccess
    ? 'success'
    : isError
      ? 'error'
      : isLoading
        ? 'loading'
        : 'loading';

  const errorMessage =
    isError && error && 'message' in error ? String(error.message) : null;

  const apiError =
    errorMessage === null
      ? null
      : new ApiError(
          error && 'code' in error && error.code === 'invalid_id'
            ? ApiErrorCode.InvalidId
            : error && 'code' in error && error.code === 'not_found'
              ? ApiErrorCode.NotFound
              : ApiErrorCode.Network,
          errorMessage,
        );

  return {
    topic: data ?? null,
    status,
    error: apiError,
    errorMessage,
    retry: () => {
      void refetch();
    },
  };
}
