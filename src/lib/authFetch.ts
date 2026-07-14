/**
 * Wrapper fetch qui envoie automatiquement le cookie d'auth HttpOnly.
 * Plus besoin de lire localStorage — le cookie est envoyé automatiquement
 * par le navigateur grâce à `credentials: 'include'`.
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",  // Envoie les cookies HttpOnly automatiquement
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
