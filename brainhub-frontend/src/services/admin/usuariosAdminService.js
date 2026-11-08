import { request } from '../api.js';

// → { id_usuario, nome, email, perfil, ativo }. O back não tem listagem de usuários.
export const criarUsuario = ({ nome, email, senha, perfil }) =>
  request('/admin/usuarios', { method: 'POST', body: { nome, email, senha, perfil } });
