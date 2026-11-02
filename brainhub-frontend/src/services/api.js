import { env } from '../config/env.js';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Token e tratador de 401 são injetados pelo AuthContext (evita dependência circular).
let getToken = () => null;
let onUnauthorized = () => {};
export const setTokenProvider = (fn) => { getToken = fn; };
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

// auth: false para rotas públicas (login). Por padrão o token é enviado.
export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new ApiError(res.status, data?.message || 'Erro inesperado. Tente novamente.');
    if (res.status === 401 && token) onUnauthorized(err);
    throw err;
  }
  return data;
}
