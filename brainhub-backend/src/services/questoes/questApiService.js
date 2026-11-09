import { env } from '../../config/env.js';
import { pool, transaction } from '../../config/database.js';
import { HttpError } from '../../utils/HttpError.js';
import sanitizeHtml from 'sanitize-html';

const FILTERS = ['banca','ano','materia','assunto','dificuldade','tipo','anulada','area','carreira','nivel_escolaridade','uf','esfera','orgao','cargo','codigo','tem_gabarito','tem_anexos'];

async function fetchFacet(path, input = {}) {
  if (!env.questApiKey) throw new HttpError(503, 'Configure QUEST_API_KEY no ambiente do backend.');
  const params = new URLSearchParams();
  if (input.materia) params.set('materia', String(input.materia));
  if (input.q) params.set('q', String(input.q).slice(0, 100));
  if (path === 'materias') params.set('limit', String(Math.min(50, Math.max(1, Number(input.limit) || 20))));
  else params.set('per_page', String(Math.min(100, Math.max(1, Number(input.per_page) || 100))));
  const url = `${env.questApiBaseUrl}/filtros/${path}?${params}`;
  let response;
  try { response = await fetch(url, { headers: { 'X-API-Key': env.questApiKey }, signal: AbortSignal.timeout(20000) }); }
  catch { throw new HttpError(502, 'Não foi possível conectar à Quest API.'); }
  if (!response.ok) {
    const status = response.status === 401 || response.status === 403 ? 502 : response.status === 429 ? 429 : 502;
    throw new HttpError(status, `Quest API respondeu com status ${response.status}.`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload?.data?.items)) throw new HttpError(502, 'Resposta dos filtros da Quest API em formato inválido.');
  return { items: payload.data.items, has_more: payload.data.has_more ?? false };
}

export async function listQuestApiSubjects(query = {}) {
  return fetchFacet('materias', query);
}

export async function listQuestApiBanks(query = {}) {
  return fetchFacet('bancas', query);
}

export async function listQuestApiYears() {
  if (!env.questApiKey) throw new HttpError(503, 'Configure QUEST_API_KEY no ambiente do backend.');
  let response;
  try { response = await fetch(`${env.questApiBaseUrl}/filtros`, { headers: { 'X-API-Key': env.questApiKey }, signal: AbortSignal.timeout(20000) }); }
  catch { throw new HttpError(502, 'Não foi possível conectar à Quest API.'); }
  if (!response.ok) {
    const status = response.status === 401 ? 502 : response.status === 403 ? 403 : response.status === 429 ? 429 : 502;
    const message = response.status === 403 ? 'A chave ou o plano da Quest API não habilita os filtros do catálogo.' : `Quest API respondeu com status ${response.status}.`;
    throw new HttpError(status, message);
  }
  const payload = await response.json();
  if (!Array.isArray(payload?.data?.anos)) throw new HttpError(502, 'Resposta dos filtros da Quest API em formato inválido.');
  return { items: payload.data.anos.map(String) };
}

export async function listQuestApiTopics(query = {}) {
  if (!query.materia) throw new HttpError(400, 'Selecione uma matéria para listar os assuntos.');
  return fetchFacet('assuntos', query);
}

function requestParams(input = {}) {
  const params = new URLSearchParams();
  for (const key of FILTERS) {
    const value = input[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') params.set(key, String(value));
  }
  params.set('include_gabarito', 'true');
  params.set('tem_gabarito', 'true');
  params.set('per_page', String(Math.min(100, Math.max(1, Number(input.per_page) || 50))));
  params.set('page', String(Math.min(10000, Math.max(1, Number(input.page) || 1))));
  return params;
}

async function fetchQuestions(input) {
  if (!env.questApiKey) throw new HttpError(503, 'Configure QUEST_API_KEY no ambiente do backend.');
  const url = `${env.questApiBaseUrl}/questoes?${requestParams(input)}`;
  let response;
  try {
    response = await fetch(url, { headers: { 'X-API-Key': env.questApiKey }, signal: AbortSignal.timeout(20000) });
  } catch {
    throw new HttpError(502, 'Não foi possível conectar à Quest API.');
  }
  if (!response.ok) {
    const status = response.status === 401 || response.status === 403 ? 502 : response.status === 402 ? 402 : response.status === 429 ? 429 : 502;
    throw new HttpError(status, `Quest API respondeu com status ${response.status}.`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload?.data?.items)) throw new HttpError(502, 'Resposta da Quest API em formato inválido.');
  return payload.data;
}

// Mesma lista de tags do front (HtmlSanitizado.jsx): o HTML da Quest API é limpo ao importar e de novo ao exibir.
const CLEAN_OPTIONS = {
  allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'ul', 'ol', 'li', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'],
  allowedAttributes: { img: ['src', 'alt', 'width', 'height'] },
  allowedSchemes: ['http', 'https'],
  disallowedTagsMode: 'discard'
};
const clean = value => sanitizeHtml(String(value ?? ''), CLEAN_OPTIONS);

function normalize(item) {
  const provas = Array.isArray(item.provas) ? item.provas : [];
  const prova = provas[0] || {};
  const alternativas = Array.isArray(item.alternativas) ? item.alternativas
    .filter(a => a?.letra && typeof a.texto === 'string')
    .map(a => ({ codigo: String(a.letra).trim().toUpperCase(), texto: clean(a.texto) })) : [];
  const gabarito = typeof item.gabarito === 'string' ? item.gabarito.trim().toUpperCase() : '';
  const classification = item.classificacao || {};
  const subject = String(classification.materia || 'Questões importadas').trim();
  const topic = String(classification.assunto || 'Sem assunto').trim();
  const rawType = prova.alternative_type || item.tipo || '';
  const type = /certo|errado/i.test(rawType) || alternativas.length === 2 && alternativas.some(a => ['C','E'].includes(a.codigo)) ? 'CERTO_ERRADO' : 'MULTIPLA_ESCOLHA';
  if (!item.id || !item.enunciado || alternativas.length < 2) return null;
  return {
    externalId: String(item.id), enunciado: clean(item.enunciado), alternativas, gabarito,
    tipo: type, materia: subject, assunto: topic,
    metadata: { numero: item.numero ?? null, tipo: item.tipo ?? null, dificuldade: item.dificuldade ?? null,
      anulada: item.anulada ?? false, provas, areas: item.areas || [], carreiras: item.carreiras || [],
      anexos: item.anexos || [], textos_associados: item.textos_associados || [] }
  };
}

async function saveQuestion(db, question) {
  const { rows: adminRows } = await db.query("SELECT id_usuario FROM usuario WHERE perfil='ADMINISTRADOR' AND ativo ORDER BY id_usuario LIMIT 1");
  if (!adminRows[0]) throw new HttpError(409, 'Cadastre um administrador antes de importar questões.');
  await db.query('INSERT INTO disciplina(nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING', [question.materia]);
  const { rows: disciplineRows } = await db.query('SELECT id_disciplina FROM disciplina WHERE nome=$1', [question.materia]);
  await db.query('INSERT INTO assunto(id_disciplina,nome) VALUES ($1,$2) ON CONFLICT (id_disciplina,nome) DO NOTHING', [disciplineRows[0].id_disciplina, question.assunto]);
  const { rows: subjectRows } = await db.query('SELECT id_assunto FROM assunto WHERE id_disciplina=$1 AND nome=$2', [disciplineRows[0].id_disciplina, question.assunto]);
  const answer = question.alternativas.some(a => a.codigo === question.gabarito) ? question.gabarito : null;
  const { rows: existing } = await db.query("SELECT id_questao FROM questao WHERE fonte='QUEST_API' AND codigo_externo=$1 FOR UPDATE", [question.externalId]);
  let idQuestion;
  let keptExplanation = null;
  if (!existing[0]) {
    const created = await db.query(`INSERT INTO questao(id_assunto,id_administrador,enunciado,tipo,ativa,fonte,codigo_externo,metadados_fonte)
      VALUES ($1,$2,$3,$4,TRUE,'QUEST_API',$5,$6) RETURNING id_questao`,
    [subjectRows[0].id_assunto, adminRows[0].id_usuario, question.enunciado, question.tipo, question.externalId, question.metadata]);
    idQuestion = created.rows[0].id_questao;
  } else {
    idQuestion = existing[0].id_questao;
    const answered = (await db.query('SELECT 1 FROM resposta WHERE id_questao=$1 LIMIT 1', [idQuestion])).rowCount > 0;
    if (answered) {
      await db.query('UPDATE questao SET metadados_fonte=$2 WHERE id_questao=$1', [idQuestion, question.metadata]);
      return { id_questao: idQuestion, atualizado: false, ignorada: true };
    }
    keptExplanation = (await db.query('SELECT explicacao FROM gabarito WHERE id_questao=$1', [idQuestion])).rows[0]?.explicacao ?? null;
    await db.query('DELETE FROM gabarito WHERE id_questao=$1', [idQuestion]);
    await db.query('DELETE FROM alternativa WHERE id_questao=$1', [idQuestion]);
    await db.query(`UPDATE questao SET id_assunto=$2,enunciado=$3,tipo=$4,metadados_fonte=$5 WHERE id_questao=$1`,
      [idQuestion, subjectRows[0].id_assunto, question.enunciado, question.tipo, question.metadata]);
  }
  const optionIds = new Map();
  for (const option of question.alternativas) {
    const inserted = await db.query('INSERT INTO alternativa(id_questao,codigo,texto) VALUES ($1,$2,$3) RETURNING id_alternativa', [idQuestion, option.codigo, option.texto]);
    optionIds.set(option.codigo, inserted.rows[0].id_alternativa);
  }
  if (answer) await db.query('INSERT INTO gabarito(id_questao,id_alternativa_correta,explicacao) VALUES ($1,$2,$3)', [idQuestion, optionIds.get(answer), keptExplanation]);
  return { id_questao: idQuestion, atualizado: Boolean(existing[0]), ignorada: false };
}

export async function importQuestions(filters = {}) {
  const data = await fetchQuestions(filters);
  const results = [];
  for (const raw of data.items) {
    const question = normalize(raw);
    if (!question) continue;
    results.push(await transaction(db => saveQuestion(db, question)));
  }
  return { recebidas: data.items.length, importadas: results.length, novas: results.filter(r => !r.atualizado).length,
    atualizadas: results.filter(r => r.atualizado && !r.ignorada).length, preservadas_com_respostas: results.filter(r => r.ignorada).length,
    total_na_api: data.total ?? null, pagina: data.page ?? null, proxima_pagina: data.has_more ? (data.page || 1) + 1 : null };
}

export async function searchQuestions(filters = {}) {
  const data = await fetchQuestions(filters);
  return { total: data.total, page: data.page, per_page: data.per_page, items: data.items };
}
