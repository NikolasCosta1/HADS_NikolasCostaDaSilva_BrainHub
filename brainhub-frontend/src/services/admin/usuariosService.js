import { request } from '../api.js';

// POST /api/admin/usuarios → cria aluno ou administrador. Só o admin pode chamar.
export const criarUsuario = (dados) => request('/admin/usuarios', { method: 'POST', body: dados });
