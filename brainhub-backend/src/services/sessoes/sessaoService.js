import { pool } from '../../config/database.js';
import { HttpError } from '../../utils/HttpError.js';
import { id, object, text } from '../../validators/common.js';

const colunas = `s.id_sessao,s.titulo,s.assunto_texto AS assunto,to_char(s.data_estudo,'YYYY-MM-DD') AS data,
  s.duracao_minutos AS "duracaoMinutos",coalesce(s.observacoes,'') AS anotacoes,
  COALESCE((SELECT json_agg(json_build_object('titulo',m.titulo,'link',m.url) ORDER BY m.id_material)
    FROM material_estudo m WHERE m.id_sessao=s.id_sessao AND m.tipo='LINK'),'[]'::json) AS materiais`;

function optionalText(value, field, max) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new HttpError(400, `${field}: até ${max} caracteres.`);
  return value.trim() || null;
}

function parse(body) {
  const b = object(body);
  const titulo = text(b.titulo, 'título', 150);
  if (typeof b.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.data) || Number.isNaN(Date.parse(b.data))) throw new HttpError(400, 'data: use AAAA-MM-DD.');
  let duracao = 1;
  if (b.duracaoMinutos !== null && b.duracaoMinutos !== undefined && b.duracaoMinutos !== '') {
    duracao = Number(b.duracaoMinutos);
    if (!Number.isInteger(duracao) || duracao < 1 || duracao > 1440) throw new HttpError(400, 'duração: de 1 a 1440 minutos.');
  }
  const materiais = Array.isArray(b.materiais) ? b.materiais.slice(0, 50).map(m => {
    const o = object(m);
    const link = text(o.link ?? '', 'link', 2000);
    return { titulo: optionalText(o.titulo, 'título do material', 150) || link.slice(0, 150), link };
  }) : [];
  return { titulo, assunto: optionalText(b.assunto, 'assunto', 150), data: b.data, duracao, anotacoes: optionalText(b.anotacoes, 'anotações', 3000), materiais };
}

async function gravarMateriais(client, sessionId, materiais) {
  await client.query('DELETE FROM material_estudo WHERE id_sessao=$1', [sessionId]);
  for (const m of materiais) {
    await client.query("INSERT INTO material_estudo(id_sessao,titulo,tipo,url) VALUES ($1,$2,'LINK',$3)", [sessionId, m.titulo, m.link]);
  }
}

async function buscar(db, sessionId, userId) {
  const { rows } = await db.query(`SELECT ${colunas} FROM sessao_estudo s WHERE s.id_sessao=$1 AND s.id_usuario=$2`, [sessionId, userId]);
  if (!rows[0]) throw new HttpError(404, 'Sessão de estudo não encontrada.');
  return rows[0];
}

export async function listSessions(userId) {
  const { rows } = await pool.query(`SELECT ${colunas} FROM sessao_estudo s WHERE s.id_usuario=$1 ORDER BY s.data_estudo DESC,s.id_sessao DESC`, [userId]);
  return rows;
}

async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function createSession(body, userId) {
  const d = parse(body);
  return transaction(async client => {
    const { rows } = await client.query(`INSERT INTO sessao_estudo(id_usuario,titulo,assunto_texto,data_estudo,duracao_minutos,observacoes)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_sessao`, [userId, d.titulo, d.assunto, d.data, d.duracao, d.anotacoes]);
    await gravarMateriais(client, rows[0].id_sessao, d.materiais);
    return buscar(client, rows[0].id_sessao, userId);
  });
}

export async function updateSession(sessionId, body, userId) {
  sessionId = id(sessionId, 'id_sessao');
  const d = parse(body);
  return transaction(async client => {
    const { rowCount } = await client.query(`UPDATE sessao_estudo SET titulo=$3,assunto_texto=$4,data_estudo=$5,duracao_minutos=$6,observacoes=$7
      WHERE id_sessao=$1 AND id_usuario=$2`, [sessionId, userId, d.titulo, d.assunto, d.data, d.duracao, d.anotacoes]);
    if (!rowCount) throw new HttpError(404, 'Sessão de estudo não encontrada.');
    await gravarMateriais(client, sessionId, d.materiais);
    return buscar(client, sessionId, userId);
  });
}

export async function deleteSession(sessionId, userId) {
  sessionId = id(sessionId, 'id_sessao');
  return transaction(async client => {
    const { rowCount } = await client.query('SELECT 1 FROM sessao_estudo WHERE id_sessao=$1 AND id_usuario=$2', [sessionId, userId]);
    if (!rowCount) throw new HttpError(404, 'Sessão de estudo não encontrada.');
    await client.query('DELETE FROM material_estudo WHERE id_sessao=$1', [sessionId]);
    await client.query('DELETE FROM sessao_estudo WHERE id_sessao=$1', [sessionId]);
    return { id_sessao: sessionId, removida: true };
  });
}
