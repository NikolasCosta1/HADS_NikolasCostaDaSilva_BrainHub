import { request } from '../api.js';

// → { page, limit, items: [{ id_assunto, assunto, id_disciplina, disciplina, tentativas, acertos, erros,
//      aproveitamento, ultima_resposta }], resumo: { assuntos_praticados, total_respondidas, total_acertos,
//      total_erros, aproveitamento_geral } }
export function buscarDesempenho({ idDisciplina, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (idDisciplina) params.set('id_disciplinas', idDisciplina);
  return request(`/relatorios/desempenho-assuntos?${params}`);
}
