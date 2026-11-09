import { pool } from '../../config/database.js';
import { HttpError } from '../../utils/HttpError.js';
import { id, pagination } from '../../validators/common.js';

function idList(value, field) {
  if (value === undefined) return null;
  const values = String(value).split(',').filter(Boolean);
  if (!values.length || values.length > 100) throw new HttpError(400, `Selecione entre 1 e 100 ${field}.`);
  return values.map(item => id(item, field));
}

const desempenhoSql = `SELECT a.id_assunto,a.nome AS assunto,d.id_disciplina,d.nome AS disciplina,
  count(r.id_resposta)::INTEGER AS tentativas,
  count(r.id_resposta) FILTER (WHERE r.acertou)::INTEGER AS acertos,
  count(r.id_resposta) FILTER (WHERE r.id_resposta IS NOT NULL AND NOT r.acertou)::INTEGER AS erros,
  round(coalesce(count(r.id_resposta) FILTER (WHERE r.acertou) * 100.0 / nullif(count(r.id_resposta),0),0),1) AS aproveitamento,
  max(r.respondida_em) AS ultima_resposta
  FROM assunto a JOIN disciplina d USING(id_disciplina)
  LEFT JOIN questao q ON q.id_assunto=a.id_assunto
  LEFT JOIN resposta r ON r.id_questao=q.id_questao AND r.id_usuario=$1
  WHERE a.ativo AND d.ativo
    AND ($2::BIGINT[] IS NULL OR d.id_disciplina=ANY($2::BIGINT[]))
    AND ($3::BIGINT[] IS NULL OR a.id_assunto=ANY($3::BIGINT[]))
  GROUP BY a.id_assunto,a.nome,d.id_disciplina,d.nome
  HAVING count(r.id_resposta)>0`;

export async function getPerformanceByTopic(userId, query = {}) {
  const { page, limit, offset } = pagination(query);
  const disciplines = idList(query.id_disciplinas, 'matérias');
  const topics = query.id_assuntos === undefined
    ? (query.id_assunto === undefined ? null : [id(query.id_assunto, 'id_assunto')])
    : idList(query.id_assuntos, 'assuntos');
  const values = [userId, disciplines, topics];
  const [itemsResult, summaryResult] = await Promise.all([
    pool.query(`SELECT * FROM (${desempenhoSql}) desempenho ORDER BY (tentativas=0),aproveitamento ASC,tentativas DESC,disciplina,assunto LIMIT $4 OFFSET $5`, [...values, limit, offset]),
    pool.query(`SELECT count(*)::INTEGER AS assuntos_catalogados,
      count(*) FILTER (WHERE tentativas>0)::INTEGER AS assuntos_praticados,
      coalesce(sum(tentativas),0)::INTEGER AS total_respondidas,
      coalesce(sum(acertos),0)::INTEGER AS total_acertos,
      coalesce(sum(erros),0)::INTEGER AS total_erros,
      round(coalesce(sum(acertos)*100.0/nullif(sum(tentativas),0),0),1) AS aproveitamento_geral
      FROM (${desempenhoSql}) desempenho`, values)
  ]);
  return { page, limit, items: itemsResult.rows, resumo: summaryResult.rows[0] };
}
