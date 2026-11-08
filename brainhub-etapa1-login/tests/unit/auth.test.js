import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../../src/utils/password.js';
import { email, password } from '../../src/validators/common.js';
test('normaliza email e valida credenciais', () => {
  assert.equal(email(' USER@EXAMPLE.COM '), 'user@example.com');
  assert.throws(() => email('invalido'), { status: 400 });
  assert.throws(() => password('curta'), { status: 400 });
});
test('hash tem salt e rejeita senha errada ou hash inválido', async () => {
  const first = await hashPassword('senha-para-teste');
  const second = await hashPassword('senha-para-teste');
  assert.notEqual(first, second);
  assert.ok(await verifyPassword('senha-para-teste', first));
  assert.equal(await verifyPassword('outra-senha', first), false);
  assert.equal(await verifyPassword('outra-senha', 'invalido'), false);
});
