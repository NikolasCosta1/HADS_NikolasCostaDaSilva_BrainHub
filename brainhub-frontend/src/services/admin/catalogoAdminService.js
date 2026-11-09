import { request } from '../api.js';
import { listarTodos } from '../paginacao.js';

// Admin vê também disciplinas/assuntos inativos.
export const listarDisciplinasAdmin = () =>
  listarTodos(params => request(`/admin/disciplinas?${params}`));

export const listarAssuntosAdmin = (idDisciplina) =>
  listarTodos(params => request(`/admin/assuntos?id_disciplina=${encodeURIComponent(idDisciplina)}&${params}`));

export const criarDisciplina = (dados) => request('/admin/disciplinas', { method: 'POST', body: dados });
export const atualizarDisciplina = (id, dados) => request(`/admin/disciplinas/${encodeURIComponent(id)}`, { method: 'PUT', body: dados });

export const criarAssunto = (dados) => request('/admin/assuntos', { method: 'POST', body: dados });
export const atualizarAssunto = (id, dados) => request(`/admin/assuntos/${encodeURIComponent(id)}`, { method: 'PUT', body: dados });
