const productionApiUrl = new URL("https://quotation-v1-y2m6.onrender.com");
const configuredApiUrl = new URL(
  (import.meta.env.VITE_API_BASE_URL || productionApiUrl.origin).trim()
);
const apiBaseUrl = import.meta.env.PROD
  && ["localhost", "127.0.0.1"].includes(configuredApiUrl.hostname)
  ? productionApiUrl
  : configuredApiUrl;

export const apiFetch = (input, init = {}) => {
  const inputUrl = input instanceof Request ? input.url : input;
  const isRelativeApiRequest =
    typeof inputUrl === "string" && inputUrl.startsWith("/api/");
  let url = new URL(inputUrl, isRelativeApiRequest ? apiBaseUrl : window.location.href);
  if (url.origin === productionApiUrl.origin && apiBaseUrl.origin !== productionApiUrl.origin) {
    url = new URL(`${url.pathname}${url.search}${url.hash}`, apiBaseUrl.origin);
  }

  const requestInput = input instanceof Request
    ? (url.href === input.url ? input : new Request(url.href, input))
    : url.href;
  const requestHeaders = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init.headers).forEach((value, name) => requestHeaders.set(name, value));

  const isBackendRequest =
    url.pathname.startsWith("/api/") &&
    url.origin === apiBaseUrl.origin;
  const token = isBackendRequest ? localStorage.getItem("token") : null;

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(requestInput, { ...init, headers: requestHeaders });
};
