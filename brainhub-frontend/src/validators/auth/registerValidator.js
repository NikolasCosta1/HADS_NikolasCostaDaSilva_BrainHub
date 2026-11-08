const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Conveniência apenas; as regras oficiais (nome até 150, senha de 8 a 128) são do back end.
export function validarCadastro({ nome, email, senha, confirmacao }) {
  const erros = {};
  const n = nome.trim();
  if (!n) erros.nome = 'Informe seu nome.';
  else if (n.length > 150) erros.nome = 'O nome pode ter até 150 caracteres.';
  const e = email.trim();
  if (!e) erros.email = 'Informe seu e-mail.';
  else if (e.length > 254 || !EMAIL.test(e)) erros.email = 'Informe um e-mail válido.';
  if (!senha) erros.senha = 'Crie uma senha.';
  else if (senha.length < 8 || senha.length > 128) erros.senha = 'A senha deve ter de 8 a 128 caracteres.';
  if (!confirmacao) erros.confirmacao = 'Repita a senha.';
  else if (confirmacao !== senha) erros.confirmacao = 'As senhas não conferem.';
  return erros;
}
