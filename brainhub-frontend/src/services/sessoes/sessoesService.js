import { request } from '../api.js';

// Sessões de estudo do aluno logado (salvas no servidor).
// GET /api/sessoes → { items }; POST/PUT /api/sessoes[/:id]; DELETE /api/sessoes/:id
export const listarSessoes = () => request('/sessoes').then(d => d.items);
export const criarSessao = (dados) => request('/sessoes', { method: 'POST', body: dados });
export const atualizarSessao = (id, dados) => request(`/sessoes/${encodeURIComponent(id)}`, { method: 'PUT', body: dados });
export const removerSessao = (id) => request(`/sessoes/${encodeURIComponent(id)}`, { method: 'DELETE' });
