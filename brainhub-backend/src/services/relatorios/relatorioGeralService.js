import { pool } from '../../config/database.js';
import { HttpError } from '../../utils/HttpError.js';
import { id } from '../../validators/common.js';

function date(value, field) {
  if (value === undefined || value === '') return null;
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) throw new HttpError(400, `${field} deve estar no formato AAAA-MM-DD.`);
  return text;
}

// Respostas de alunos (administradores que respondem questões não entram), dentro do período e da disciplina pedidos.
const FROM_WHERE = `FROM resposta r
  JOIN usuario u ON u.id_usuario=r.id_usuario AND u.perfil='ALUNO'
  JOIN questao q ON q.id_questao=r.id_questao
  JOIN assunto a ON a.id_assunto=q.id_assunto
  JOIN disciplina d ON d.id_disciplina=a.id_disciplina
  WHERE ($1::DATE IS NULL OR r.respondida_em >= $1::DATE)
    AND ($2::DATE IS NULL OR r.respondida_em < $2::DATE + 1)
    AND ($3::BIGINT IS NULL OR d.id_disciplina=$3::BIGINT)`;

export async function getGeneralReport(query = {}) {
  const from = date(query.data_inicio, 'data_inicio');
  const to = date(query.data_fim, 'data_fim');
  if (from && to && from > to) throw new HttpError(400, 'data_inicio não pode ser maior que data_fim.');
  const discipline = query.id_disciplina === undefined || query.id_disciplina === '' ? null : id(query.id_disciplina, 'id_disciplina');
  const params = [from, to, discipline];
  const [summary, topics, totals] = await Promise.all([
    pool.query(`SELECT count(r.id_resposta)::INTEGER AS total_respostas,
      count(r.id_resposta) FILTER (WHERE r.acertou)::INTEGER AS total_acertos,
      count(DISTINCT r.id_usuario)::INTEGER AS alunos_com_respostas,
      round(coalesce(count(r.id_resposta) FILTER (WHERE r.acertou)*100.0/nullif(count(r.id_resposta),0),0),1) AS aproveitamento_geral
      ${FROM_WHERE}`, params),
    pool.query(`SELECT d.id_disciplina,d.nome AS disciplina,a.id_assunto,a.nome AS assunto,
      count(r.id_resposta)::INTEGER AS tentativas,
      count(r.id_resposta) FILTER (WHERE r.acertou)::INTEGER AS acertos,
      count(DISTINCT r.id_usuario)::INTEGER AS alunos,
      round(count(r.id_resposta) FILTER (WHERE r.acertou)*100.0/count(r.id_resposta),1) AS aproveitamento
      ${FROM_WHERE}
      GROUP BY d.id_disciplina,d.nome,a.id_assunto,a.nome
      ORDER BY aproveitamento ASC,tentativas DESC,d.nome,a.nome LIMIT 500`, params),
    pool.query(`SELECT
      (SELECT count(*)::INTEGER FROM usuario WHERE perfil='ALUNO' AND ativo) AS alunos_ativos,
      (SELECT count(*)::INTEGER FROM questao q JOIN assunto a USING(id_assunto) JOIN disciplina d USING(id_disciplina)
        WHERE q.ativa AND a.ativo AND d.ativo AND ($1::BIGINT IS NULL OR d.id_disciplina=$1::BIGINT)) AS questoes_ativas`, [discipline])
  ]);
  return {
    filtros: { data_inicio: from, data_fim: to, id_disciplina: discipline },
    resumo: { ...totals.rows[0], ...summary.rows[0] },
    assuntos: topics.rows
  };
}
