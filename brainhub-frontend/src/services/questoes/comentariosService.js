import { request } from '../api.js';

const base = (idQuestao) => `/questoes/${encodeURIComponent(idQuestao)}/comentarios`;

// → { items: [{ id_comentario, id_usuario, texto, criado_em, atualizado_em, autor }] }
export const listarComentarios = (idQuestao) => request(base(idQuestao));
export const criarComentario = (idQuestao, texto) => request(base(idQuestao), { method: 'POST', body: { texto } });
export const editarComentario = (idQuestao, idComentario, texto) =>
  request(`${base(idQuestao)}/${encodeURIComponent(idComentario)}`, { method: 'PUT', body: { texto } });
export const removerComentario = (idQuestao, idComentario) =>
  request(`${base(idQuestao)}/${encodeURIComponent(idComentario)}`, { method: 'DELETE' });
