const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação apenas de conveniência; o back end continua sendo a validação oficial.
export function validarLogin({ email, senha }) {
  const erros = {};
  const e = email.trim();
  if (!e) erros.email = 'Informe seu e-mail.';
  else if (e.length > 254 || !EMAIL.test(e)) erros.email = 'Informe um e-mail válido.';
  if (!senha) erros.senha = 'Informe sua senha.';
  return erros;
}
