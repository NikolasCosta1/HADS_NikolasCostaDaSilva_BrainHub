import { request } from '../api.js';

export const listarMateriasQuestApi = (q = '') =>
  request(`/admin/questoes/quest-api/filtros/materias${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const listarAssuntosQuestApi = (materia, q = '') => {
  const params = new URLSearchParams({ materia });
  if (q) params.set('q', q);
  return request(`/admin/questoes/quest-api/filtros/assuntos?${params}`);
};

export const listarBancasQuestApi = (q = '') =>
  request(`/admin/questoes/quest-api/filtros/bancas${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const listarAnosQuestApi = () => request('/admin/questoes/quest-api/filtros/anos');

function montarParams(filtros) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') params.set(chave, valor);
  }
  return params;
}

// Pré-visualização: mesmos filtros que serão usados na importação, sem gravar nada
// nem gastar créditos além da própria consulta de busca.
export const previsualizarQuestoesQuestApi = (filtros) => request(`/admin/questoes/quest-api?${montarParams(filtros)}`);

// Importação de fato: consome créditos da Quest API. O front deve sempre confirmar
// com o usuário antes de chamar isto (nunca importar automaticamente).
export const sincronizarQuestoesQuestApi = (filtros) => request('/admin/questoes/sincronizar', { method: 'POST', body: filtros });
