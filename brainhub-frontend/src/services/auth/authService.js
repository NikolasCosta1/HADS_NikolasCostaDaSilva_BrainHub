import { request } from '../api.js';

// POST /api/auth/login → { token, token_type, expires_in, usuario: { id_usuario, nome, email, perfil } }
export async function login({ email, senha }) {
  const data = await request('/auth/login', { method: 'POST', body: { email, senha }, auth: false });
  if (!data?.token || !data?.usuario?.perfil) throw new Error('Resposta de login inválida.');
  return { token: data.token, usuario: data.usuario };
}

// GET /api/me → dados do usuário do token (usado para validar a sessão ao abrir o app).
export const me = () => request('/me');

// POST /api/auth/register → cadastro público de aluno. Mesmo formato de resposta do login.
export async function registerAluno({ nome, email, senha }) {
  const data = await request('/auth/register', { method: 'POST', body: { nome, email, senha }, auth: false });
  if (!data?.token || !data?.usuario?.perfil) throw new Error('Resposta de cadastro inválida.');
  return { token: data.token, usuario: data.usuario };
}
