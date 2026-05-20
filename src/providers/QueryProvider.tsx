import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { KimaiApiError } from "../api/kimaiClient";

export interface ApiErrorEvent {
  status: number;
  statusText: string;
  endpoint: string | undefined;
  message: string;
  body: unknown;
  timestamp: number;
}

function emitServerError(error: unknown) {
  if (!(error instanceof KimaiApiError) || error.code !== "server_error")
    return;
  const detail: ApiErrorEvent = {
    status: error.status,
    statusText: error.statusText,
    endpoint: error.endpoint,
    message: error.message,
    body: error.body,
    timestamp: Date.now(),
  };
  window.dispatchEvent(new CustomEvent("kimai-api-error", { detail }));
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: emitServerError,
  }),
  mutationCache: new MutationCache({
    onError: emitServerError,
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        if (error instanceof KimaiApiError && error.isAuth) return false;
        return count < 1;
      },
    },
  },
});

export default function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
