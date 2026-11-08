import { request } from '../api.js';

const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== null && String(v).trim() !== '') p.set(k, String(v)); });
  return p.toString();
};

// Filtros auxiliares: { items: [...] }. O formato de cada item vem da Quest API (texto ou objeto).
export const listarMaterias = (q) => request(`/admin/questoes/quest-api/filtros/materias?${qs({ q, limit: 50 })}`);
export const listarAssuntosQuest = (materia, q) => request(`/admin/questoes/quest-api/filtros/assuntos?${qs({ materia, q })}`);
export const listarBancas = (q) => request(`/admin/questoes/quest-api/filtros/bancas?${qs({ q })}`);
export const listarAnos = () => request('/admin/questoes/quest-api/filtros/anos');

// Pré-visualização: { total, page, per_page, items } (questões cruas, nada é gravado).
// Atenção: a Quest API pode cobrar créditos por consulta também.
export const previsualizar = (filtros, page, perPage) =>
  request(`/admin/questoes/quest-api?${qs({ ...filtros, page, per_page: perPage })}`);

// Grava no banco local: { recebidas, importadas, novas, atualizadas, preservadas_com_respostas, total_na_api, proxima_pagina }
export const sincronizar = (filtros, page, perPage) =>
  request('/admin/questoes/sincronizar', { method: 'POST', body: { ...filtros, page, per_page: perPage } });
