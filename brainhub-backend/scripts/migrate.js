import { readFile } from 'node:fs/promises';
import { pool } from '../src/config/database.js';
const client=await pool.connect();
try {
  // Um único script inicial. Se as tabelas já existem, não reexecutar.
  const exists=await client.query("SELECT to_regclass('public.usuario') AS tabela");
  if (exists.rows[0].tabela) throw new Error('Modelo já existe. Não reexecute a migration inicial.');
  const sql=await readFile(new URL('../database/migrations/001_modelo_inicial.sql',import.meta.url),'utf8');
  await client.query(sql);console.log('Modelo inicial criado.');
} catch(err) { await client.query('ROLLBACK');console.error(err.message);process.exitCode=1; }
finally { client.release();await pool.end(); }
