import { request } from '../api.js';

const rota = (idQuestao) => `/caderno/${encodeURIComponent(idQuestao)}`;

// GET /api/caderno → { items: [{ id_questao, id_resposta, anotacao, respostaErrada, gabarito, explicacao, ... }] }
export const listarCaderno = () => request('/caderno');

// GET /api/caderno/erradas → { items: [...] } questões erradas que ainda não têm anotação.
export const listarErradasSemAnotacao = () => request('/caderno/erradas');

// POST: cria (ou refaz) a anotação de uma questão que o aluno errou.
export const salvarNoCaderno = (idQuestao, idResposta, anotacao) =>
  request(rota(idQuestao), { method: 'POST', body: { id_resposta: idResposta, anotacao } });

export const atualizarAnotacao = (idQuestao, anotacao) => request(rota(idQuestao), { method: 'PUT', body: { anotacao } });

export const removerDoCaderno = (idQuestao) => request(rota(idQuestao), { method: 'DELETE' });
