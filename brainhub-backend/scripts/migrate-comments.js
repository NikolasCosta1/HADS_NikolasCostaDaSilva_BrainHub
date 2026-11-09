import { readFile } from 'node:fs/promises';
import { pool } from '../src/config/database.js';
try {
  const sql = await readFile(new URL('../database/migrations/003_comentarios_questoes.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('Comentários por questão aplicados (migração repetível).');
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
