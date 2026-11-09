import { useState } from 'react';
import PasswordField from './PasswordField.jsx';
import { validarCadastro } from '../../validators/auth/registerValidator.js';
import { mensagemErroCadastro } from '../../utils/mensagensLogin.js';

export default function RegisterForm({ onSubmit }) {
  const [valores, setValores] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => {
    const { name, value } = e.target;
    setValores((v) => ({ ...v, [name]: value }));
    if (erros[name]) setErros((x) => ({ ...x, [name]: undefined }));
    if (erroGeral) setErroGeral('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    const novos = validarCadastro(valores);
    setErros(novos);
    if (Object.keys(novos).length) {
      const ordem = ['nome', 'email', 'senha', 'confirmarSenha'];
      document.getElementById(ordem.find((campo) => novos[campo]))?.focus();
      return;
    }
    setEnviando(true);
    setErroGeral('');
    try {
      await onSubmit({ nome: valores.nome.trim(), email: valores.email.trim(), senha: valores.senha });
    } catch (err) {
      setErroGeral(err.status !== undefined ? mensagemErroCadastro(err) : 'Não foi possível concluir o cadastro. Tente novamente.');
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="form">
      <div className="alert" role="alert" hidden={!erroGeral}>{erroGeral}</div>

      <div className="field">
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" type="text" autoComplete="name" placeholder="Seu nome completo"
          value={valores.nome} onChange={alterar} maxLength={150} autoFocus
          aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'nome-erro' : undefined} />
        {erros.nome && <p className="field-error" id="nome-erro">{erros.nome}</p>}
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" inputMode="email" placeholder="voce@exemplo.com"
          value={valores.email} onChange={alterar} maxLength={254}
          aria-invalid={!!erros.email} aria-describedby={erros.email ? 'email-erro' : undefined} />
        {erros.email && <p className="field-error" id="email-erro">{erros.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="senha">Senha</label>
        <PasswordField id="senha" name="senha" autoComplete="new-password" placeholder="Mínimo de 8 caracteres"
          value={valores.senha} onChange={alterar} error={erros.senha} />
        {erros.senha && <p className="field-error" id="senha-erro">{erros.senha}</p>}
      </div>

      <div className="field">
        <label htmlFor="confirmarSenha">Confirmar senha</label>
        <PasswordField id="confirmarSenha" name="confirmarSenha" autoComplete="new-password" placeholder="Repita a senha"
          value={valores.confirmarSenha} onChange={alterar} error={erros.confirmarSenha} />
        {erros.confirmarSenha && <p className="field-error" id="confirmarSenha-erro">{erros.confirmarSenha}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? <><span className="spinner" aria-hidden="true" /> Cadastrando…</> : 'Criar conta'}
      </button>
    </form>
  );
}
