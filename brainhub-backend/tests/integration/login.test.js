import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
process.env.JWT_SECRET = 'segredo-apenas-de-testes-mais-de-32-caracteres';
const { pool } = await import('../../src/config/database.js');
const { hashPassword } = await import('../../src/utils/password.js');
const { default: jwt } = await import('jsonwebtoken');
const { default: app } = await import('../../src/app.js');
const db = new PGlite();
await db.exec(await readFile(new URL('../../database/migrations/001_modelo_inicial.sql', import.meta.url), 'utf8'));
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
  const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: res.status, body: await res.json() };
}
test('login, JWT, conta bloqueada/inativa, auditoria e remoção dos demais módulos', async () => {
  try {
    await db.query("INSERT INTO usuario(nome,email,senha_hash,perfil) VALUES ('Admin','admin@example.test',$1,'ADMINISTRADOR')", [await hashPassword('senha-correta-123')]);
    const credentials = { email: 'ADMIN@example.test', senha: 'senha-correta-123' };
    const result = await call('POST', '/auth/login', credentials);
    assert.equal(result.status, 200);
    assert.ok(result.body.token);
    assert.equal(result.body.expires_in, 3600);
    assert.equal('senha_hash' in result.body.usuario, false);
    const me = await call('GET', '/auth/me', null, result.body.token);
    assert.equal(me.status, 200);
    assert.equal(me.body.email, 'admin@example.test');
    assert.equal('senha_hash' in me.body, false);
    assert.equal((await call('GET', '/auth/me')).status, 401);
    assert.equal((await call('GET', '/auth/me', null, 'invalido')).status, 401);
    const expired = jwt.sign({}, process.env.JWT_SECRET, { subject: String(me.body.id_usuario), expiresIn: -1, issuer: 'brainhub', audience: 'brainhub-web' });
    assert.equal((await call('GET', '/auth/me', null, expired)).status, 401);
    assert.equal((await call('GET', '/admin/questoes', null, result.body.token)).status, 404);
    assert.equal((await call('POST', '/auth/login', { email: 'ausente@example.test', senha: 'senha-correta-123' })).status, 401);
    for (let i = 0; i < 3; i++) assert.equal((await call('POST', '/auth/login', { ...credentials, senha: 'senha-errada-123' })).status, 401);
    assert.equal((await call('POST', '/auth/login', credentials)).status, 401);
    const blocked = (await db.query('SELECT tentativas_falhas,bloqueado_ate FROM usuario')).rows[0];
    assert.equal(blocked.tentativas_falhas, 3);
    assert.ok(blocked.bloqueado_ate);
    await db.query("UPDATE usuario SET bloqueado_ate=CURRENT_TIMESTAMP - INTERVAL '1 minute'");
    assert.equal((await call('POST', '/auth/login', credentials)).status, 200);
    assert.equal((await db.query('SELECT tentativas_falhas FROM usuario')).rows[0].tentativas_falhas, 0);
    await db.query('UPDATE usuario SET ativo=FALSE');
    assert.equal((await call('POST', '/auth/login', credentials)).status, 401);
    assert.equal((await call('GET', '/auth/me', null, result.body.token)).status, 401);
    assert.ok((await db.query('SELECT count(*)::INTEGER AS n FROM log_autenticacao')).rows[0].n >= 8);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await db.close(); await pool.end();
  }
});
