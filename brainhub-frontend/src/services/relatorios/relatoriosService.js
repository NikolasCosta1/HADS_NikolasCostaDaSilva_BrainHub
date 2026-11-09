import { request } from '../api.js';

// GET /api/relatorios/desempenho-assuntos → { page, limit, items: [...], resumo: {...} }
// items: assuntos com pelo menos uma tentativa, ordenados pelos que mais precisam de reforço.
export function buscarDesempenhoPorAssunto({ idDisciplina, idAssunto, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (idDisciplina) params.set('id_disciplina', idDisciplina);
  if (idAssunto) params.set('id_assunto', idAssunto);
  return request(`/relatorios/desempenho-assuntos?${params}`);
}
