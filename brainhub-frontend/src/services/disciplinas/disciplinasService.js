import { request } from '../api.js';
import { listarTodos } from '../paginacao.js';

export const listarDisciplinas = () =>
  listarTodos(params => request(`/disciplinas?${params}`));

export const listarAssuntos = (idDisciplina) =>
  listarTodos(params => request(`/assuntos?id_disciplina=${encodeURIComponent(idDisciplina)}&${params}`));
