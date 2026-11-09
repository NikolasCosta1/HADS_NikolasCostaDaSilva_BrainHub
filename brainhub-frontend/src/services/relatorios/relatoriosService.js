import { request } from '../api.js';

// GET /api/relatorios/desempenho-assuntos → { page, limit, items: [...], resumo: {...} }
// items: assuntos com pelo menos uma tentativa, ordenados pelos que mais precisam de reforço.
export function buscarDesempenhoPorAssunto({ idDisciplina, idAssunto, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (idDisciplina) params.set('id_disciplinas', idDisciplina);
  if (idAssunto) params.set('id_assunto', idAssunto);
  return request(`/relatorios/desempenho-assuntos?${params}`);
}

// GET /api/admin/relatorios/geral → { filtros, resumo, assuntos: [...] } (só administrador).
// resumo: alunos_ativos, questoes_ativas, total_respostas, total_acertos, alunos_com_respostas, aproveitamento_geral.
export function buscarRelatorioGeral({ dataInicio, dataFim, idDisciplina } = {}) {
  const params = new URLSearchParams();
  if (dataInicio) params.set('data_inicio', dataInicio);
  if (dataFim) params.set('data_fim', dataFim);
  if (idDisciplina) params.set('id_disciplina', idDisciplina);
  return request(`/admin/relatorios/geral?${params}`);
}
