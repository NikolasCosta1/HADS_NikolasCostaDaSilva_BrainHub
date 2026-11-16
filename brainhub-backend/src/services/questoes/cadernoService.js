import { pool } from '../../config/database.js';
import { HttpError } from '../../utils/HttpError.js';
import { id, object } from '../../validators/common.js';

const listarQuery = `SELECT c.id_questao,c.id_resposta,c.anotacao,c.criado_em,c.atualizado_em,
  q.id_assunto,q.enunciado,q.tipo,q.fonte,q.codigo_externo,q.metadados_fonte,a.nome AS assunto,d.nome AS disciplina,
  resposta_errada.codigo AS "respostaErrada", gabarito.codigo AS gabarito, g.explicacao AS explicacao,
  COALESCE((SELECT json_agg(json_build_object('id_alternativa',alt.id_alternativa,'codigo',alt.codigo,'texto',alt.texto) ORDER BY alt.codigo)
    FROM alternativa alt WHERE alt.id_questao=q.id_questao), '[]'::json) AS alternativas
  FROM caderno_questao c
  JOIN questao q ON q.id_questao=c.id_questao
  JOIN assunto a ON a.id_assunto=q.id_assunto
  JOIN disciplina d ON d.id_disciplina=a.id_disciplina
  JOIN resposta r ON r.id_resposta=c.id_resposta AND r.id_usuario=c.id_usuario AND r.id_questao=c.id_questao AND NOT r.acertou
  JOIN alternativa resposta_errada ON resposta_errada.id_alternativa=r.id_alternativa
  JOIN gabarito g ON g.id_questao=q.id_questao
  JOIN alternativa gabarito ON gabarito.id_alternativa=g.id_alternativa_correta
  WHERE c.id_usuario=$1`;

export async function listNotebook(userId) {
  const { rows } = await pool.query(`${listarQuery} ORDER BY c.criado_em DESC,c.id_questao DESC`, [userId]);
  return rows;
}

export async function addNotebookQuestion(questionId, body, userId) {
  questionId = id(questionId, 'id_questao');
  const data = object(body);
  const responseId = data.id_resposta === undefined || data.id_resposta === null || data.id_resposta === ''
    ? null : id(data.id_resposta, 'id_resposta');
  const note = data.anotacao === undefined ? '' : data.anotacao;
  if (typeof note !== 'string' || note.trim().length > 3000) throw new HttpError(400, 'Anotação: use até 3000 caracteres.');

  const failedResponse = await pool.query(`SELECT id_resposta FROM resposta
    WHERE id_usuario=$1 AND id_questao=$2 AND acertou=FALSE AND ($3::BIGINT IS NULL OR id_resposta=$3)
    ORDER BY respondida_em DESC,id_resposta DESC LIMIT 1`, [userId, questionId, responseId]);
  if (!failedResponse.rows[0]) throw new HttpError(409, 'Só é possível adicionar ao caderno uma questão que você errou.');

  const { rows } = await pool.query(`INSERT INTO caderno_questao(id_usuario,id_questao,id_resposta,anotacao)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (id_usuario,id_questao) DO UPDATE SET id_resposta=EXCLUDED.id_resposta,
      anotacao=CASE WHEN $5::BOOLEAN THEN EXCLUDED.anotacao ELSE caderno_questao.anotacao END,
      atualizado_em=CURRENT_TIMESTAMP
    RETURNING id_questao`, [userId, questionId, failedResponse.rows[0].id_resposta, note.trim(), data.anotacao !== undefined]);
  return (await pool.query(`${listarQuery} AND c.id_questao=$2`, [userId, rows[0].id_questao])).rows[0];
}

export async function updateNotebookNote(questionId, body, userId) {
  questionId = id(questionId, 'id_questao');
  const data = object(body);
  const note = data.anotacao;
  if (typeof note !== 'string' || note.trim().length > 3000) throw new HttpError(400, 'Anotação: use até 3000 caracteres.');
  const { rowCount } = await pool.query(`UPDATE caderno_questao SET anotacao=$3,atualizado_em=CURRENT_TIMESTAMP
    WHERE id_usuario=$1 AND id_questao=$2`, [userId, questionId, note.trim()]);
  if (!rowCount) throw new HttpError(404, 'Questão não encontrada no seu caderno.');
  return (await pool.query(`${listarQuery} AND c.id_questao=$2`, [userId, questionId])).rows[0];
}

export async function removeNotebookQuestion(questionId, userId) {
  questionId = id(questionId, 'id_questao');
  const { rowCount } = await pool.query('DELETE FROM caderno_questao WHERE id_usuario=$1 AND id_questao=$2', [userId, questionId]);
  if (!rowCount) throw new HttpError(404, 'Questão não encontrada no seu caderno.');
  return { id_questao: questionId, removida: true };
}

// Questões que o aluno errou e ainda não estão no caderno (última resposta errada de cada uma).
// Serve para a tela "Nova anotação": o aluno escolhe uma delas para anotar o que errou.
export async function listWrongNotInNotebook(userId) {
  const { rows } = await pool.query(`SELECT * FROM (
      SELECT DISTINCT ON (r.id_questao) r.id_questao,r.id_resposta,r.respondida_em,q.enunciado,a.nome AS assunto,d.nome AS disciplina,alt.codigo AS "respostaErrada"
      FROM resposta r
      JOIN questao q ON q.id_questao=r.id_questao
      JOIN assunto a ON a.id_assunto=q.id_assunto
      JOIN disciplina d ON d.id_disciplina=a.id_disciplina
      JOIN alternativa alt ON alt.id_alternativa=r.id_alternativa
      WHERE r.id_usuario=$1 AND NOT r.acertou
        AND NOT EXISTS (SELECT 1 FROM caderno_questao c WHERE c.id_usuario=r.id_usuario AND c.id_questao=r.id_questao)
      ORDER BY r.id_questao,r.respondida_em DESC,r.id_resposta DESC
    ) erradas ORDER BY respondida_em DESC LIMIT 100`, [userId]);
  return rows;
}
