import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';
import { HttpError } from '../utils/HttpError.js';
export async function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new HttpError(401, 'Autenticação necessária.');
  let claims;
  try { claims = jwt.verify(header.slice(7), env.jwtSecret, { algorithms: ['HS256'], issuer: 'brainhub', audience: 'brainhub-web' }); }
  catch { throw new HttpError(401, 'Token inválido ou expirado.'); }
  if (typeof claims !== 'object' || !/^[1-9][0-9]*$/.test(claims.sub || '')) throw new HttpError(401, 'Token inválido.');
  const { rows } = await pool.query('SELECT id_usuario,nome,email,perfil,ativo FROM usuario WHERE id_usuario=$1', [claims.sub]);
  if (!rows[0]?.ativo) throw new HttpError(401, 'Usuário indisponível.');
  req.user = rows[0]; next();
}
export const requireRole = roles => (req, _res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(req.user?.perfil)) throw new HttpError(403, 'Perfil sem permissão para esta operação.');
  next();
};
