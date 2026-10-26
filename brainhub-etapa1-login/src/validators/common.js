import { HttpError } from '../utils/HttpError.js';
export function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Envie um objeto JSON.');
  return value;
}
export function text(value, field, max = 20000) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new HttpError(400, `${field}: texto obrigatório, até ${max} caracteres.`);
  return value.trim();
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
