import { QueryClient, QueryObserver, type DefaultError, type QueryKey, type QueryObserverOptions, type QueryObserverResult } from "@tanstack/query-core"

const queryClient = new QueryClient()

type SuccessCallback<TData> = (data: TData) => void;
type ErrorCallback<TError> = (error: TError) => void;
type BeforeSendCallback = () => void;

declare global {
  interface JQueryStatic {
    query: <
      TQueryFnData = unknown,
      TError = DefaultError,
      TData = TQueryFnData,
      TQueryData = TQueryFnData,
      TQueryKey extends QueryKey = QueryKey,
    >(
      options: QueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>
    ) => QueryBuilder<TQueryFnData, TError, TData, TQueryData, TQueryKey>;
  }
}

type QueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey> & {
  onSuccess?: SuccessCallback<TData>;
  onError?: ErrorCallback<TError>;
  beforeSend?: BeforeSendCallback;
}

class QueryBuilder<
  TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> {
  options: QueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>;
  observer: QueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey>
  unsubscribe: (() => void) | null = null;
  private hasCalledBeforeSend = false;

  constructor(queryOptions: QueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>) {
    this.options = queryOptions;

    this.observer = new QueryObserver(queryClient, this.options);

    const initialResult = this.observer.getCurrentResult();
    this._handleResult(initialResult);

    this.unsubscribe = this.observer.subscribe(() => {
      this._handleResult(this.observer.getCurrentResult());
    })
  }

  _handleResult = (result: QueryObserverResult<TData, TError>): void => {
    if (result.status === 'pending') {
      if (!this.hasCalledBeforeSend && this.options.beforeSend) {
        this.options.beforeSend();
        this.hasCalledBeforeSend = true;
      }
    } else if (result.status === 'error') {
      this.hasCalledBeforeSend = false;
      if (this.options.onError) {
        this.options.onError(result.error);
      }
    } else if (result.status === 'success') {
      this.hasCalledBeforeSend = false;
      if (this.options.onSuccess) {
        this.options.onSuccess(result.data);
      }
    }
  }
}

$.query = (options) => {
  return new QueryBuilder(options);
};
