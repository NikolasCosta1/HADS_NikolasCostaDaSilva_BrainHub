const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação apenas de conveniência; o back end continua sendo a validação oficial.
export function validarCadastro({ nome, email, senha, confirmarSenha }) {
  const erros = {};
  const n = nome.trim();
  if (!n) erros.nome = 'Informe seu nome.';
  else if (n.length < 2 || n.length > 150) erros.nome = 'Informe um nome válido.';

  const e = email.trim();
  if (!e) erros.email = 'Informe seu e-mail.';
  else if (e.length > 254 || !EMAIL.test(e)) erros.email = 'Informe um e-mail válido.';

  if (!senha) erros.senha = 'Crie uma senha.';
  else if (senha.length < 8 || senha.length > 128) erros.senha = 'A senha deve ter de 8 a 128 caracteres.';

  if (!confirmarSenha) erros.confirmarSenha = 'Confirme sua senha.';
  else if (confirmarSenha !== senha) erros.confirmarSenha = 'As senhas não coincidem.';

  return erros;
}
