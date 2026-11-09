export async function getQuestion(db, questionId, admin = false) {
  const { rows } = await db.query(`SELECT q.id_questao,q.id_assunto,q.enunciado,q.tipo,q.ativa,q.criado_em,q.fonte,q.codigo_externo,q.metadados_fonte,
    a.nome AS assunto,d.id_disciplina,d.nome AS disciplina
    FROM questao q JOIN assunto a USING(id_assunto) JOIN disciplina d USING(id_disciplina)
    WHERE q.id_questao=$1 ${admin ? '' : 'AND q.ativa AND a.ativo AND d.ativo'}`, [questionId]);
  if (!rows[0]) return null;
  const question = rows[0];
  question.alternativas = (await db.query('SELECT id_alternativa,codigo,texto FROM alternativa WHERE id_questao=$1 ORDER BY codigo', [questionId])).rows;
  question.comentarios = (await db.query(`SELECT c.id_comentario,c.id_usuario,c.texto,c.criado_em,c.atualizado_em,u.nome AS autor
    FROM comentario_questao c JOIN usuario u USING(id_usuario) WHERE c.id_questao=$1 ORDER BY c.criado_em,c.id_comentario`, [questionId])).rows;
  if (admin) {
    const answer = (await db.query('SELECT a.codigo AS gabarito,g.explicacao FROM gabarito g JOIN alternativa a ON a.id_alternativa=g.id_alternativa_correta WHERE g.id_questao=$1', [questionId])).rows[0];
    Object.assign(question, answer);
  }
  return question;
}
export async function saveOptionsAndAnswer(db, questionId, data) {
  let correctId;
  for (const option of data.alternativas) {
    const { rows } = await db.query('INSERT INTO alternativa(id_questao,codigo,texto) VALUES ($1,$2,$3) RETURNING id_alternativa', [questionId,option.codigo,option.texto]);
    if (option.codigo === data.gabarito) correctId=rows[0].id_alternativa;
  }
  await db.query('INSERT INTO gabarito(id_questao,id_alternativa_correta,explicacao) VALUES ($1,$2,$3)', [questionId,correctId,data.explicacao ?? null]);
}
