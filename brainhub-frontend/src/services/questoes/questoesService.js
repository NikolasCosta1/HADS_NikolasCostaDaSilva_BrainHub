import { request } from '../api.js';

// Lista sem alternativas nem gabarito. Só questões ativas, de disciplinas e assuntos ativos.
// Cada item traz também fonte ('LOCAL' ou 'QUEST_API') e metadados_fonte.
export function listarQuestoes({ idDisciplina, idAssunto, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (idDisciplina) params.set('id_disciplina', idDisciplina);
  if (idAssunto) params.set('id_assunto', idAssunto);
  return request(`/questoes?${params}`);
}

// Detalhe com alternativas (id_alternativa, codigo, texto), fonte e metadados_fonte. Nunca traz o gabarito.
export const buscarQuestao = (id) => request(`/questoes/${encodeURIComponent(id)}`);

// Resposta: { id_resposta, acertou, respondida_em, gabarito, explicacao? }
// A explicação só vem depois que o back passar a devolvê-la (ver patch em /back-patch).
export const responderQuestao = (id, idAlternativa) =>
  request(`/questoes/${encodeURIComponent(id)}/respostas`, {
    method: 'POST',
    body: { id_alternativa: idAlternativa },
  });
