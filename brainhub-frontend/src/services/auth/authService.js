import { request } from '../api.js';

// POST /api/auth/login (público). Contrato em docs/login.md.
export async function login({ email, senha }) {
  const data = await request('/auth/login', { method: 'POST', body: { email, senha } });
  const usuario = data?.usuario;
  if (!data?.token || !usuario?.perfil) throw new Error('Resposta de login inválida.');
  return { token: data.token, usuario };
}
