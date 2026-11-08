import { pool } from '../../config/database.js';
import { HttpError } from '../../utils/HttpError.js';
import { id, object, text } from '../../validators/common.js';

async function assertQuestionAvailable(questionId) {
  const exists = (await pool.query(`SELECT 1 FROM questao q JOIN assunto a USING(id_assunto) JOIN disciplina d USING(id_disciplina)
    WHERE q.id_questao=$1 AND q.ativa AND a.ativo AND d.ativo`, [questionId])).rowCount;
  if (!exists) throw new HttpError(404, 'Questão indisponível.');
}

export async function listComments(questionId) {
  questionId = id(questionId, 'id_questao');
  await assertQuestionAvailable(questionId);
  const { rows } = await pool.query(`SELECT c.id_comentario,c.id_questao,c.id_usuario,c.texto,c.criado_em,c.atualizado_em,u.nome AS autor
    FROM comentario_questao c JOIN usuario u USING(id_usuario) WHERE c.id_questao=$1
    ORDER BY c.criado_em,c.id_comentario`, [questionId]);
  return rows;
}

export async function createComment(questionId, body, userId) {
  questionId = id(questionId, 'id_questao');
  const b = object(body);
  const comment = text(b.texto, 'comentário', 3000);
  await assertQuestionAvailable(questionId);
  const { rows } = await pool.query(`INSERT INTO comentario_questao(id_questao,id_usuario,texto)
    VALUES ($1,$2,$3) RETURNING id_comentario,id_questao,id_usuario,texto,criado_em,atualizado_em`, [questionId, userId, comment]);
  const saved = rows[0];
  const author = await pool.query('SELECT nome FROM usuario WHERE id_usuario=$1', [userId]);
  return { ...saved, autor: author.rows[0].nome };
}

async function ownedComment(questionId, commentId, user) {
  const { rows } = await pool.query('SELECT id_comentario,id_usuario FROM comentario_questao WHERE id_questao=$1 AND id_comentario=$2', [questionId, commentId]);
  if (!rows[0]) throw new HttpError(404, 'Comentário não encontrado.');
  if (String(rows[0].id_usuario) !== String(user.id_usuario) && user.perfil !== 'ADMINISTRADOR') throw new HttpError(403, 'Você só pode editar ou remover seus próprios comentários.');
  return rows[0];
}

export async function updateComment(questionId, commentId, body, user) {
  questionId = id(questionId, 'id_questao'); commentId = id(commentId, 'id_comentario');
  const b = object(body), comment = text(b.texto, 'comentário', 3000);
  await ownedComment(questionId, commentId, user);
  const { rows } = await pool.query(`UPDATE comentario_questao SET texto=$3,atualizado_em=CURRENT_TIMESTAMP
    WHERE id_questao=$1 AND id_comentario=$2 RETURNING id_comentario,id_questao,id_usuario,texto,criado_em,atualizado_em`, [questionId, commentId, comment]);
  const author = await pool.query('SELECT nome FROM usuario WHERE id_usuario=$1', [rows[0].id_usuario]);
  return { ...rows[0], autor: author.rows[0].nome };
}

export async function deleteComment(questionId, commentId, user) {
  questionId = id(questionId, 'id_questao'); commentId = id(commentId, 'id_comentario');
  await ownedComment(questionId, commentId, user);
  await pool.query('DELETE FROM comentario_questao WHERE id_questao=$1 AND id_comentario=$2', [questionId, commentId]);
  return { id_comentario: commentId, removido: true };
}
