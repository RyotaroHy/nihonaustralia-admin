import { DefaultOptions, UseMutationOptions } from '@tanstack/react-query';

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: true,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;

export type ApiFnReturnType<
  FnType extends (...args: unknown[]) => Promise<unknown>,
> = Awaited<ReturnType<FnType>>;

export type QueryConfig<T> = Partial<Omit<T, 'queryKey' | 'queryFn'>>;

export type MutationConfig<
  MutationFnType extends (...args: unknown[]) => Promise<unknown>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;