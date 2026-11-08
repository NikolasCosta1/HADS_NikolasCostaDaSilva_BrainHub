import { request } from '../api.js';

export function listarQuestoesAdmin({ idDisciplina, idAssunto, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (idDisciplina) params.set('id_disciplina', idDisciplina);
  if (idAssunto) params.set('id_assunto', idAssunto);
  return request(`/admin/questoes?${params}`);
}
// Detalhe do admin inclui gabarito (e a explicação, depois do patch do back).
export const buscarQuestaoAdmin = (id) => request(`/admin/questoes/${encodeURIComponent(id)}`);
export const criarQuestao = (dados) => request('/admin/questoes', { method: 'POST', body: dados });
export const atualizarQuestao = (id, dados) => request(`/admin/questoes/${encodeURIComponent(id)}`, { method: 'PUT', body: dados });
export const inativarQuestao = (id) => request(`/admin/questoes/${encodeURIComponent(id)}/inativar`, { method: 'PATCH' });
