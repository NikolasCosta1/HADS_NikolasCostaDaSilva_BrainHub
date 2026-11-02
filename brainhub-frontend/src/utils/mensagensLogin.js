// Traduz a resposta do back para o usuário.
// O back responde 401 tanto para credenciais erradas quanto para conta bloqueada/inativa
// (de propósito, para não revelar se o e-mail existe). Por isso a mensagem cobre os dois casos.
export function mensagemErroLogin(err) {
  switch (err.status) {
    case 0: return err.message;
    case 400: return err.message || 'Dados inválidos. Revise e tente novamente.';
    case 401: return 'E-mail ou senha inválidos, ou conta temporariamente bloqueada.';
    case 429: return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
    default: return err.status >= 500
      ? 'Servidor indisponível no momento. Tente novamente em instantes.'
      : (err.message || 'Não foi possível entrar.');
  }
}
