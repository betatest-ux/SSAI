import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

let authToken = "";

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (!url) {
    throw new Error(
      "Rork did not set EXPO_PUBLIC_RORK_API_BASE_URL, please use support",
    );
  }

  console.log('tRPC Base URL:', url);
  return url;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        return {
          authorization: authToken ? `Bearer ${authToken}` : "",
        };
      },
      fetch(url, options) {
        console.log('TRPC Request:', url, options?.method);
        return fetch(url, options).then(res => {
          console.log('TRPC Response:', res.status, res.statusText);
          if (!res.ok) {
            return res.text().then(text => {
              console.error('TRPC Error Response:', text);
              throw new Error(`HTTP ${res.status}: ${text}`);
            });
          }
          return res;
        }).catch(err => {
          console.error('TRPC Fetch Error:', err);
          throw err;
        });
      },
    }),
  ],
});
