export type DataResult<T> = {
  data: T | null;
  error: string | null;
};

export const toDataResult = <T>(
  data: T | null,
  error?: { message: string } | null,
): DataResult<T> => ({
  data,
  error: error?.message ?? null,
});

export const toErrorResult = <T>(message: string): DataResult<T> => ({
  data: null,
  error: message,
});

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';
