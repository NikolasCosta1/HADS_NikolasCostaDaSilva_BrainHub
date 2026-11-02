export function mensagemErroQuestao(err) {
  switch (err.status) {
    case 0: return err.message;
    case 400: return err.message || 'Não foi possível processar a solicitação.';
    case 403: return 'Seu perfil não pode realizar esta ação.';
    case 404: return 'Esta questão não está mais disponível.';
    case 409: return err.message || 'Esta questão não pode ser respondida agora.';
    default: return err.status >= 500
      ? 'Servidor indisponível no momento. Tente novamente em instantes.'
      : (err.message || 'Não foi possível concluir a ação.');
  }
}
