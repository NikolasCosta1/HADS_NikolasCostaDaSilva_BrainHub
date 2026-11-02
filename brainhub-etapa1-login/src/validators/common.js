import { HttpError } from '../utils/HttpError.js';
export function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Envie um objeto JSON.');
  return value;
}
export function text(value, field, max = 20000) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new HttpError(400, `${field}: texto obrigatório, até ${max} caracteres.`);
  return value.trim();
}
export function id(value, field = 'id') {
  const s = typeof value === 'string' || Number.isSafeInteger(value) ? String(value) : '';
  if (!/^[1-9][0-9]*$/.test(s) || BigInt(s) > 9223372036854775807n) throw new HttpError(400, `${field}: identificador inválido.`);
  return s;
}
export function boolean(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') throw new HttpError(400, 'Use true ou false.');
  return value;
}
export function pagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000000 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new HttpError(400, 'page deve ser positivo e limit deve estar entre 1 e 100.');
  return { page, limit, offset: (page - 1) * limit };
}
export function password(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) throw new HttpError(400, 'Senha deve ter de 8 a 128 caracteres.');
  return value;
}
export function email(value) {
  const normalized = text(value, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new HttpError(400, 'E-mail inválido.');
  return normalized;
}
