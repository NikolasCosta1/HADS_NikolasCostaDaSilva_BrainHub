import { HttpError } from '../../utils/HttpError.js';
import { object, text, id, boolean } from '../common.js';
export function validateQuestion(body) {
  const b = object(body);
  if (!['MULTIPLA_ESCOLHA', 'CERTO_ERRADO'].includes(b.tipo)) throw new HttpError(400, 'Tipo de questão inválido.');
  const expected = b.tipo === 'MULTIPLA_ESCOLHA' ? ['A','B','C','D','E'] : ['C','E'];
  if (!Array.isArray(b.alternativas) || b.alternativas.length !== expected.length) throw new HttpError(400, `Informe exatamente ${expected.length} alternativas.`);
  const alternativas = b.alternativas.map(item => {
    const a = object(item);
    return { codigo: text(a.codigo, 'codigo', 1), texto: text(a.texto, 'texto da alternativa', 10000) };
  });
  if (new Set(alternativas.map(a => a.codigo)).size !== expected.length || alternativas.some(a => !expected.includes(a.codigo))) throw new HttpError(400, `Códigos obrigatórios: ${expected.join(', ')}.`);
  if (!expected.includes(b.gabarito)) throw new HttpError(400, 'Gabarito deve indicar uma das alternativas.');
  return { id_assunto: id(b.id_assunto, 'id_assunto'), enunciado: text(b.enunciado, 'enunciado'), tipo: b.tipo, ativa: boolean(b.ativa, true), alternativas, gabarito: b.gabarito, explicacao: text(b.explicacao, 'explicacao') };
}
