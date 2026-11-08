export function mensagemErroQuestao(err) {
  switch (err.status) {
    case 0: return err.message;
    case 400: return err.message || 'Não foi possível processar a solicitação.';
    case 403: return err.message || 'Seu perfil não pode realizar esta ação.';
    case 404: return err.message || 'Este item não está mais disponível.';
    case 409: return err.message || 'Esta ação não pode ser realizada agora.';
    case 402: return 'Os créditos da Quest API acabaram.';
    case 429: return 'Muitas requisições. Aguarde um pouco e tente novamente.';
    case 502: case 503: return err.message || 'Serviço externo indisponível no momento.';
    default: return err.status >= 500
      ? 'Servidor indisponível no momento. Tente novamente em instantes.'
      : (err.message || 'Não foi possível concluir a ação.');
  }
}
