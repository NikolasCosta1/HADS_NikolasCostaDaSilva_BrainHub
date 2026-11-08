export function mensagemErroCadastro(err) {
  switch (err.status) {
    case 0: return err.message;
    case 400: return err.message || 'Dados inválidos. Revise e tente novamente.';
    case 409: return 'Já existe uma conta cadastrada com este e-mail.';
    case 429: return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
    default: return err.status >= 500
      ? 'Servidor indisponível no momento. Tente novamente em instantes.'
      : (err.message || 'Não foi possível concluir o cadastro.');
  }
}
