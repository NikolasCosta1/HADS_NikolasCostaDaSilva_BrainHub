export const CODIGOS_POR_TIPO = {
  MULTIPLA_ESCOLHA: ['A', 'B', 'C', 'D', 'E'],
  CERTO_ERRADO: ['C', 'E'],
};

// Validação de conveniência; o back end (src/validators/questoes/questaoValidator.js) é quem decide de fato.
export function validarQuestaoAdmin(valores) {
  const erros = {};
  if (!valores.id_assunto) erros.id_assunto = 'Selecione um assunto.';
  if (!valores.enunciado.trim()) erros.enunciado = 'Informe o enunciado.';

  const codigos = CODIGOS_POR_TIPO[valores.tipo] || [];
  const alternativasVazias = valores.alternativas.some((a, i) => !a.texto.trim() && codigos[i]);
  if (alternativasVazias) erros.alternativas = 'Preencha o texto de todas as alternativas.';

  if (!valores.gabarito || !codigos.includes(valores.gabarito)) erros.gabarito = 'Selecione o gabarito.';

  return erros;
}
