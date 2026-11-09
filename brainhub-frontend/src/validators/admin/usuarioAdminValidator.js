const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação de conveniência; o back end é quem decide de fato.
export function validarUsuarioAdmin({ nome, email, senha, perfil }) {
  const erros = {};
  const n = nome.trim();
  if (!n) erros.nome = 'Informe o nome.';
  else if (n.length < 2 || n.length > 150) erros.nome = 'Informe um nome válido.';

  const e = email.trim();
  if (!e) erros.email = 'Informe o e-mail.';
  else if (e.length > 254 || !EMAIL.test(e)) erros.email = 'Informe um e-mail válido.';

  if (!senha) erros.senha = 'Crie uma senha.';
  else if (senha.length < 8 || senha.length > 128) erros.senha = 'A senha deve ter de 8 a 128 caracteres.';

  if (!['ALUNO', 'ADMINISTRADOR'].includes(perfil)) erros.perfil = 'Selecione um perfil.';

  return erros;
}
