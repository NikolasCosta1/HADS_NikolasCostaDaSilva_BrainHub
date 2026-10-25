import { pool } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';
import { text, email, password } from '../src/validators/common.js';
try {
  const name = text(process.env.ADMIN_NAME, 'ADMIN_NAME', 150);
  const mail = email(process.env.ADMIN_EMAIL);
  const hash = await hashPassword(password(process.env.ADMIN_PASSWORD));
  const { rows } = await pool.query(
    "INSERT INTO usuario(nome,email,senha_hash,perfil) VALUES ($1,$2,$3,'ADMINISTRADOR') RETURNING id_usuario,email",
    [name, mail, hash],
  );
  console.log('Administrador criado:', rows[0].id_usuario, rows[0].email);
} catch (err) {
  console.error(err.code === '23505' ? 'E-mail já cadastrado.' : err.message);
  process.exitCode = 1;
} finally { await pool.end(); }
