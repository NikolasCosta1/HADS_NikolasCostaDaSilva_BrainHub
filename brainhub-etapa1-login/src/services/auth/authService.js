import jwt from 'jsonwebtoken';
import { transaction } from '../../config/database.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/HttpError.js';
import { object, email, password } from '../../validators/common.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
// Usuário inexistente também executa scrypt para reduzir diferenças de tempo.
const dummyHash = await hashPassword('dummy-internal-password');
export async function login(body, ip) {
  const b = object(body), loginEmail = email(b.email), secret = password(b.senha);
  const result = await transaction(async db => {
    const { rows } = await db.query('SELECT * FROM usuario WHERE lower(trim(email))=$1 FOR UPDATE', [loginEmail]);
    const user = rows[0];
    if (!user) {
      await verifyPassword(secret, dummyHash);
      await db.query("INSERT INTO log_autenticacao(evento,sucesso,endereco_ip) VALUES ('LOGIN',FALSE,$1)", [ip]);
      return null;
    }
    if (!user.ativo || (user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date())) {
      await db.query("INSERT INTO log_autenticacao(id_usuario,evento,sucesso,endereco_ip) VALUES ($1,'LOGIN',FALSE,$2)", [user.id_usuario,ip]);
      return null;
    }
    if (!(await verifyPassword(secret, user.senha_hash))) {
      const count = (user.bloqueado_ate ? 0 : user.tentativas_falhas) + 1;
      await db.query("UPDATE usuario SET tentativas_falhas=$2::SMALLINT,bloqueado_ate=CASE WHEN $2::SMALLINT>=3 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE NULL END WHERE id_usuario=$1", [user.id_usuario,count]);
      await db.query("INSERT INTO log_autenticacao(id_usuario,evento,sucesso,endereco_ip) VALUES ($1,'LOGIN',FALSE,$2)", [user.id_usuario,ip]);
      return null; // Não lançar aqui: as falhas devem ser COMMITadas.
    }
    await db.query('UPDATE usuario SET tentativas_falhas=0,bloqueado_ate=NULL WHERE id_usuario=$1', [user.id_usuario]);
    await db.query("INSERT INTO log_autenticacao(id_usuario,evento,sucesso,endereco_ip) VALUES ($1,'LOGIN',TRUE,$2)", [user.id_usuario,ip]);
    return { id_usuario:user.id_usuario, nome:user.nome, email:user.email, perfil:user.perfil };
  });
  if (!result) throw new HttpError(401, 'Credenciais inválidas ou conta temporariamente indisponível.');
  const token = jwt.sign({}, env.jwtSecret, { subject:String(result.id_usuario), algorithm:'HS256', expiresIn:'1h', issuer:'brainhub', audience:'brainhub-web' });
  return { token, token_type:'Bearer', expires_in:3600, usuario:result };
}
