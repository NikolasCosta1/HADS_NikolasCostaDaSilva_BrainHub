import { pool, transaction } from '../../config/database.js';
import { object, text, id, boolean, pagination } from '../../validators/common.js';
import { HttpError } from '../../utils/HttpError.js';
export async function listCatalog(kind,query,admin) {
  const { page,limit,offset }=pagination(query);
  const subject=kind==='assunto';
  const parent=subject && query.id_disciplina!==undefined ? id(query.id_disciplina,'id_disciplina') : null;
  const sql=subject ? `SELECT a.id_assunto,a.nome,a.descricao,a.ativo,a.id_disciplina,d.nome AS disciplina FROM assunto a JOIN disciplina d USING(id_disciplina) WHERE ($1::BIGINT IS NULL OR a.id_disciplina=$1) ${admin?'':'AND a.ativo AND d.ativo'} ORDER BY a.id_assunto LIMIT $2 OFFSET $3`
    : `SELECT id_disciplina,nome,descricao,ativo FROM disciplina ${admin?'':'WHERE ativo'} ORDER BY id_disciplina LIMIT $1 OFFSET $2`;
  return { page,limit,items:(await pool.query(sql,subject?[parent,limit,offset]:[limit,offset])).rows };
}
export async function saveCatalog(kind,body,recordId) {
  const b=object(body), name=text(b.nome,'nome',kind==='assunto'?150:100);
  const description=b.descricao==null?null:text(b.descricao,'descricao',5000);
  const active=boolean(b.ativo,true), subject=kind==='assunto';
  const parent=subject?id(b.id_disciplina,'id_disciplina'):null;
  return transaction(async db=>{
    if (recordId && subject) {
      const existing=(await db.query('SELECT * FROM assunto WHERE id_assunto=$1 FOR UPDATE',[id(recordId)])).rows[0];
      if (!existing) throw new HttpError(404,'Assunto não encontrado.');
      if (String(existing.id_disciplina)!==parent) throw new HttpError(409,'Não é permitido mover assuntos entre disciplinas; crie outro assunto.');
    }
    let sql,values;
    if (subject) {
      sql=recordId?'UPDATE assunto SET nome=$1,descricao=$2,ativo=$3 WHERE id_assunto=$4 RETURNING *':'INSERT INTO assunto(nome,descricao,ativo,id_disciplina) VALUES ($1,$2,$3,$4) RETURNING *';
      values=[name,description,active,recordId?id(recordId):parent];
    } else {
      sql=recordId?'UPDATE disciplina SET nome=$1,descricao=$2,ativo=$3 WHERE id_disciplina=$4 RETURNING *':'INSERT INTO disciplina(nome,descricao,ativo) VALUES ($1,$2,$3) RETURNING *';
      values=recordId?[name,description,active,id(recordId)]:[name,description,active];
    }
    const { rows }=await db.query(sql,values);
    if (!rows[0]) throw new HttpError(404,'Registro não encontrado.'); return rows[0];
  });
}
