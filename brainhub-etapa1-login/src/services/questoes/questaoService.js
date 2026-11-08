import { pool, transaction } from '../../config/database.js';
import { HttpError } from '../../utils/HttpError.js';
import { id, pagination, object } from '../../validators/common.js';
import { validateQuestion } from '../../validators/questoes/questaoValidator.js';
import { getQuestion, saveOptionsAndAnswer } from '../../repositories/questoes/questaoRepository.js';
async function checkSubject(db, subjectId) {
  const { rows } = await db.query('SELECT a.id_assunto FROM assunto a JOIN disciplina d USING(id_disciplina) WHERE a.id_assunto=$1 AND a.ativo AND d.ativo FOR SHARE OF a,d', [subjectId]);
  if (!rows[0]) throw new HttpError(400,'Selecione um assunto e uma disciplina ativos.');
}
export async function createQuestion(body, adminId) {
  const data=validateQuestion(body);
  return transaction(async db => {
    await checkSubject(db,data.id_assunto);
    const { rows } = await db.query('INSERT INTO questao(id_assunto,id_administrador,enunciado,tipo,ativa) VALUES ($1,$2,$3,$4,FALSE) RETURNING id_questao', [data.id_assunto,adminId,data.enunciado,data.tipo]);
    const questionId=rows[0].id_questao;
    await saveOptionsAndAnswer(db,questionId,data);
    await db.query('UPDATE questao SET ativa=$2 WHERE id_questao=$1',[questionId,data.ativa]);
    return getQuestion(db,questionId,true);
  });
}
export async function updateQuestion(questionId,body) {
  questionId=id(questionId); const data=validateQuestion(body);
  return transaction(async db => {
    const { rows }=await db.query('SELECT id_questao FROM questao WHERE id_questao=$1 FOR UPDATE',[questionId]);
    if (!rows[0]) throw new HttpError(404,'Questão não encontrada.');
    if ((await db.query('SELECT 1 FROM resposta WHERE id_questao=$1 LIMIT 1',[questionId])).rowCount) throw new HttpError(409,'Questão já respondida: inative e cadastre uma nova.');
    await checkSubject(db,data.id_assunto);
    await db.query('DELETE FROM gabarito WHERE id_questao=$1',[questionId]);
    await db.query('DELETE FROM alternativa WHERE id_questao=$1',[questionId]);
    await db.query('UPDATE questao SET id_assunto=$2,enunciado=$3,tipo=$4,ativa=$5 WHERE id_questao=$1',[questionId,data.id_assunto,data.enunciado,data.tipo,data.ativa]);
    await saveOptionsAndAnswer(db,questionId,data);
    return getQuestion(db,questionId,true);
  });
}
export async function deactivateQuestion(questionId) {
  const { rows }=await pool.query('UPDATE questao SET ativa=FALSE WHERE id_questao=$1 RETURNING id_questao,ativa',[id(questionId)]);
  if (!rows[0]) throw new HttpError(404,'Questão não encontrada.'); return rows[0];
}
export async function findQuestion(questionId,admin) {
  const result=await getQuestion(pool,id(questionId),admin);
  if (!result) throw new HttpError(404,'Questão não encontrada.'); return result;
}
export async function listQuestions(query,admin) {
  const { page,limit,offset }=pagination(query);
  const parseIds=(value,field)=>{
    const values=String(value).split(',').filter(Boolean);
    if (!values.length || values.length>100) throw new HttpError(400,`Selecione entre 1 e 100 ${field}.`);
    return values.map(item=>id(item,field));
  };
  const subjects=query.id_assuntos === undefined
    ? (query.id_assunto === undefined ? null : [id(query.id_assunto,'id_assunto')])
    : parseIds(query.id_assuntos,'assuntos');
  const disciplines=query.id_disciplinas === undefined
    ? (query.id_disciplina === undefined ? null : [id(query.id_disciplina,'id_disciplina')])
    : parseIds(query.id_disciplinas,'matérias');
  const { rows }=await pool.query(`SELECT q.id_questao,q.id_assunto,q.enunciado,q.tipo,q.ativa,q.fonte,q.codigo_externo,q.metadados_fonte,a.nome AS assunto,d.nome AS disciplina
    FROM questao q JOIN assunto a USING(id_assunto) JOIN disciplina d USING(id_disciplina)
    WHERE ($1::BIGINT[] IS NULL OR q.id_assunto=ANY($1::BIGINT[])) AND ($2::BIGINT[] IS NULL OR d.id_disciplina=ANY($2::BIGINT[]))
    ${admin ? '' : 'AND q.ativa AND a.ativo AND d.ativo'} ORDER BY q.id_questao DESC LIMIT $3 OFFSET $4`,[subjects,disciplines,limit,offset]);
  return { page,limit,items:rows };
}
export async function answerQuestion(questionId,body,userId) {
  questionId=id(questionId); const b=object(body), optionId=id(b.id_alternativa,'id_alternativa');
  return transaction(async db => {
    const { rows }=await db.query('SELECT id_questao,id_assunto,ativa FROM questao WHERE id_questao=$1 FOR UPDATE',[questionId]);
    if (!rows[0]?.ativa) throw new HttpError(404,'Questão indisponível.');
    await checkSubject(db,rows[0].id_assunto);
    if (!(await db.query('SELECT 1 FROM alternativa WHERE id_questao=$1 AND id_alternativa=$2',[questionId,optionId])).rowCount) throw new HttpError(400,'Alternativa não pertence à questão.');
    const answer=(await db.query('SELECT g.id_alternativa_correta,g.explicacao,a.codigo FROM gabarito g JOIN alternativa a ON a.id_alternativa=g.id_alternativa_correta WHERE g.id_questao=$1',[questionId])).rows[0];
    if (!answer) throw new HttpError(409,'Questão sem gabarito.');
    const correct=String(answer.id_alternativa_correta)===String(optionId);
    const saved=(await db.query('INSERT INTO resposta(id_usuario,id_questao,id_alternativa,acertou) VALUES ($1,$2,$3,$4) RETURNING id_resposta,acertou,respondida_em',[userId,questionId,optionId,correct])).rows[0];
    return { ...saved,gabarito:answer.codigo,explicacao:answer.explicacao ?? null };
  });
}
