import { request } from '../api.js';

// Lista sem alternativas nem gabarito. Só questões ativas, de disciplinas e assuntos ativos.
export function listarQuestoes({ idDisciplina, idAssunto, banca, ano, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (idDisciplina) params.set('id_disciplina', idDisciplina);
  if (idAssunto) params.set('id_assunto', idAssunto);
  if (banca) params.set('banca', banca);
  if (ano) params.set('ano', ano);
  return request(`/questoes?${params}`);
}

// GET /api/questoes/filtros → { bancas: [...], anos: [...] } com os valores existentes no banco.
export const listarOpcoesFiltro = () => request('/questoes/filtros');

// Detalhe com alternativas (id_alternativa, codigo, texto). Nunca traz o gabarito.
export const buscarQuestao = (id) => request(`/questoes/${encodeURIComponent(id)}`);

// Resposta: { id_resposta, acertou, respondida_em, gabarito, explicacao }
export const responderQuestao = (id, idAlternativa) =>
  request(`/questoes/${encodeURIComponent(id)}/respostas`, {
    method: 'POST',
    body: { id_alternativa: idAlternativa },
  });
