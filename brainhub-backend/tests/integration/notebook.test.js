import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

process.env.JWT_SECRET = 'segredo-apenas-de-testes-mais-de-32-caracteres';
const { pool } = await import('../../src/config/database.js');
const { default: jwt } = await import('jsonwebtoken');
const { default: app } = await import('../../src/app.js');
const db = new PGlite();
await db.exec(await readFile(new URL('../../database/migrations/001_modelo_inicial.sql', import.meta.url), 'utf8'));
await db.exec(await readFile(new URL('../../database/migrations/002_quest_api.sql', import.meta.url), 'utf8'));
await db.exec(await readFile(new URL('../../database/migrations/004_caderno_questoes.sql', import.meta.url), 'utf8'));
const query = async (sql, params) => {
  const result = await db.query(sql, params);
  return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
};
pool.query = query;
pool.connect = async () => ({ query, release() {} });
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;
async function call(method, path, body, token) {
  const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body != null ? { body: JSON.stringify(body) } : {}) });
  return { status: res.status, body: await res.json() };
}
function tokenFor(id) {
  return jwt.sign({}, process.env.JWT_SECRET, { subject: String(id), expiresIn: '1h', issuer: 'brainhub', audience: 'brainhub-web' });
}

test('caderno salva somente questões erradas e mantém itens e anotações privados', async () => {
  try {
    const users = await db.query(`INSERT INTO usuario(nome,email,senha_hash,perfil) VALUES
      ('Ana','ana@example.test','hash','ALUNO'),('Bia','bia@example.test','hash','ALUNO') RETURNING id_usuario`);
    const [ana, bia] = users.rows.map(row => String(row.id_usuario));
    const subject = (await db.query("INSERT INTO disciplina(nome) VALUES ('Matemática') RETURNING id_disciplina")).rows[0].id_disciplina;
    const topic = (await db.query("INSERT INTO assunto(id_disciplina,nome) VALUES ($1,'Álgebra') RETURNING id_assunto", [subject])).rows[0].id_assunto;
    const question = (await db.query("INSERT INTO questao(id_assunto,enunciado,tipo,ativa) VALUES ($1,'Quanto é 2 + 2?','MULTIPLA_ESCOLHA',TRUE) RETURNING id_questao", [topic])).rows[0].id_questao;
    const wrongOption = (await db.query("INSERT INTO alternativa(id_questao,codigo,texto) VALUES ($1,'A','3') RETURNING id_alternativa", [question])).rows[0].id_alternativa;
    const rightOption = (await db.query("INSERT INTO alternativa(id_questao,codigo,texto) VALUES ($1,'B','4') RETURNING id_alternativa", [question])).rows[0].id_alternativa;
    await db.query('INSERT INTO gabarito(id_questao,id_alternativa_correta) VALUES ($1,$2)', [question, rightOption]);
    const failed = (await db.query('INSERT INTO resposta(id_usuario,id_questao,id_alternativa,acertou) VALUES ($1,$2,$3,FALSE) RETURNING id_resposta', [ana, question, wrongOption])).rows[0].id_resposta;
    const correct = (await db.query('INSERT INTO resposta(id_usuario,id_questao,id_alternativa,acertou) VALUES ($1,$2,$3,TRUE) RETURNING id_resposta', [bia, question, rightOption])).rows[0].id_resposta;
    const anaToken = tokenFor(ana), biaToken = tokenFor(bia), id = String(question);

    assert.equal((await call('GET', '/caderno', null, anaToken)).body.items.length, 0);
    assert.equal((await call('POST', `/caderno/${id}`, { id_resposta: correct }, biaToken)).status, 409);
    assert.equal((await call('GET', '/caderno/erradas', null, anaToken)).body.items.length, 1);
    assert.equal((await call('GET', '/caderno/erradas', null, biaToken)).body.items.length, 0);
    const added = await call('POST', `/caderno/${id}`, { id_resposta: failed }, anaToken);
    assert.equal(added.status, 201);
    assert.equal(added.body.respostaErrada, 'A');
    assert.equal(added.body.gabarito, 'B');
    assert.deepEqual(added.body.alternativas.map(option => option.codigo), ['A', 'B']);
    assert.equal((await call('GET', '/caderno', null, biaToken)).body.items.length, 0);
    assert.equal((await call('GET', '/caderno/erradas', null, anaToken)).body.items.length, 0);

    const saved = await call('PUT', `/caderno/${id}`, { anotacao: 'Esqueci de somar corretamente.' }, anaToken);
    assert.equal(saved.status, 200);
    assert.equal(saved.body.anotacao, 'Esqueci de somar corretamente.');
    assert.equal((await call('DELETE', `/caderno/${id}`, null, biaToken)).status, 404);
    assert.equal((await call('DELETE', `/caderno/${id}`, null, anaToken)).body.removida, true);
    assert.equal((await call('GET', '/caderno', null, anaToken)).body.items.length, 0);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await db.close(); await pool.end();
  }
});
