import { request } from '../api.js';
import { listarTodos } from '../paginacao.js';

// Versões do admin enxergam também os itens inativos.
export const listarDisciplinasAdmin = () => listarTodos(p => request(`/admin/disciplinas?${p}`));
export const listarAssuntosAdmin = (idDisciplina) =>
  listarTodos(p => request(`/admin/assuntos?${idDisciplina ? `id_disciplina=${encodeURIComponent(idDisciplina)}&` : ''}${p}`));

export const salvarDisciplina = ({ id, nome, descricao, ativo }) =>
  request(id ? `/admin/disciplinas/${encodeURIComponent(id)}` : '/admin/disciplinas', {
    method: id ? 'PUT' : 'POST', body: { nome, descricao: descricao || null, ativo },
  });
export const salvarAssunto = ({ id, idDisciplina, nome, descricao, ativo }) =>
  request(id ? `/admin/assuntos/${encodeURIComponent(id)}` : '/admin/assuntos', {
    method: id ? 'PUT' : 'POST', body: { id_disciplina: idDisciplina, nome, descricao: descricao || null, ativo },
  });
