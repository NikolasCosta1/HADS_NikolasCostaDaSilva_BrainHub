// Traduz o status HTTP em mensagem amigável, sem revelar se o e-mail existe.
export function mensagemErroLogin(err) {
  switch (err.status) {
    case 0: return err.message;
    case 400: return err.message || 'Dados inválidos. Revise e tente novamente.';
    case 401: return 'E-mail ou senha incorretos.';
    case 403: return 'Seu acesso está desativado. Procure o administrador.';
    case 423: return 'Conta temporariamente bloqueada após tentativas incorretas. Tente novamente mais tarde.';
    case 429: return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
    default: return err.status >= 500 ? 'Servidor indisponível no momento. Tente novamente em instantes.' : (err.message || 'Não foi possível entrar.');
  }
}
