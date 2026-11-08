export const CODIGOS = { MULTIPLA_ESCOLHA: ['A', 'B', 'C', 'D', 'E'], CERTO_ERRADO: ['C', 'E'] };

// Conveniência apenas; o back valida de novo (tipo, alternativas, gabarito e assunto ativo).
export function validarQuestaoForm(v) {
  const erros = {};
  if (!v.idAssunto) erros.idAssunto = 'Escolha disciplina e assunto.';
  if (!v.enunciado.trim()) erros.enunciado = 'Informe o enunciado.';
  const codigos = CODIGOS[v.tipo];
  const vazias = codigos.filter(c => !(v.alternativas[c] || '').trim());
  if (vazias.length) erros.alternativas = `Preencha todas as alternativas (${vazias.join(', ')}).`;
  if (!codigos.includes(v.gabarito)) erros.gabarito = 'Marque a alternativa correta.';
  return erros;
}
