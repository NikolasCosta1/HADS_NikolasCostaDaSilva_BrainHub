import { useState } from 'react';
import PasswordField from './PasswordField.jsx';
import { validarLogin } from '../../validators/auth/loginValidator.js';
import { mensagemErroLogin } from '../../utils/mensagensLogin.js';

export default function LoginForm({ onSubmit }) {
  const [valores, setValores] = useState({ email: '', senha: '' });
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
    const novos = validarLogin(valores);
    setErros(novos);
    if (Object.keys(novos).length) {
      document.getElementById(novos.email ? 'email' : 'senha')?.focus();
      return;
    }
    setEnviando(true);
    setErroGeral('');
    try {
      await onSubmit({ email: valores.email.trim(), senha: valores.senha });
    } catch (err) {
      setErroGeral(err.status !== undefined ? mensagemErroLogin(err) : 'Não foi possível entrar. Tente novamente.');
      setValores((v) => ({ ...v, senha: '' }));
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="form">
      <div className="alert" role="alert" hidden={!erroGeral}>{erroGeral}</div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" inputMode="email" placeholder="voce@exemplo.com"
          value={valores.email} onChange={alterar} maxLength={254} autoFocus
          aria-invalid={!!erros.email} aria-describedby={erros.email ? 'email-erro' : undefined} />
        {erros.email && <p className="field-error" id="email-erro">{erros.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="senha">Senha</label>
        <PasswordField id="senha" name="senha" autoComplete="current-password" placeholder="Sua senha"
          value={valores.senha} onChange={alterar} error={erros.senha} />
        {erros.senha && <p className="field-error" id="senha-erro">{erros.senha}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? <><span className="spinner" aria-hidden="true" /> Entrando…</> : 'Entrar'}
      </button>
    </form>
  );
}
