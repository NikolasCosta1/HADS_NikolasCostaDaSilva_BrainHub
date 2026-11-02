// O node-postgres devolve colunas BIGINT como texto ("2"), por isso aceita número ou texto numérico.
// Validação de conveniência; a regra oficial é do back end.
export function validarResposta(idAlternativa) {
  const valor = String(idAlternativa ?? '').trim();
  if (!/^[1-9][0-9]*$/.test(valor)) {
    return 'Escolha uma alternativa antes de responder.';
  }
  return null;
}
