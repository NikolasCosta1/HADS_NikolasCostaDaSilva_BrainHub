import { request } from '../api.js';

// GET /api/questoes/:id/comentarios → { items: [{ id_comentario, id_usuario, texto, criado_em, atualizado_em, autor }] }
export const listarComentarios = (idQuestao) =>
  request(`/questoes/${encodeURIComponent(idQuestao)}/comentarios`);

export const criarComentario = (idQuestao, texto) =>
  request(`/questoes/${encodeURIComponent(idQuestao)}/comentarios`, { method: 'POST', body: { texto } });

export const atualizarComentario = (idQuestao, idComentario, texto) =>
  request(`/questoes/${encodeURIComponent(idQuestao)}/comentarios/${encodeURIComponent(idComentario)}`, { method: 'PUT', body: { texto } });

export const removerComentario = (idQuestao, idComentario) =>
  request(`/questoes/${encodeURIComponent(idQuestao)}/comentarios/${encodeURIComponent(idComentario)}`, { method: 'DELETE' });
