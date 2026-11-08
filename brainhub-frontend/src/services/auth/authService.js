import { request } from '../api.js';

function lerSessao(data, msg) {
  if (!data?.token || !data?.usuario?.perfil) throw new Error(msg);
  return { token: data.token, usuario: data.usuario };
}

// POST /api/auth/login → { token, token_type, expires_in, usuario: { id_usuario, nome, email, perfil } }
export async function login({ email, senha }) {
  const data = await request('/auth/login', { method: 'POST', body: { email, senha }, auth: false });
  return lerSessao(data, 'Resposta de login inválida.');
}

// POST /api/auth/register (público, sempre perfil ALUNO) → mesma resposta do login (201).
export async function registrar({ nome, email, senha }) {
  const data = await request('/auth/register', { method: 'POST', body: { nome, email, senha }, auth: false });
  return lerSessao(data, 'Resposta de cadastro inválida.');
}

// GET /api/me → dados do usuário do token (usado para validar a sessão ao abrir o app).
export const me = () => request('/me');
