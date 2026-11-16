import { useState } from 'react';
import { AlertCircle, ArrowRight, Mail, User } from 'lucide-react';
import PasswordField from './PasswordField.jsx';
import { validarCadastro } from '../../validators/auth/registerValidator.js';
import { mensagemErroCadastro } from '../../utils/mensagensLogin.js';

function MensagemErro({ id, texto }) {
  if (!texto) return null;
  return (
    <p className="bh-field-error-text" id={id}>
      <AlertCircle size={14} />
      <span>{texto}</span>
    </p>
  );
}

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
    <form onSubmit={enviar} noValidate className="bh-auth-form">
      {erroGeral && (
        <div className="bh-alert-box bh-alert-danger" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{erroGeral}</div>
        </div>
      )}

      <div className="bh-input-group">
        <label htmlFor="nome">Nome</label>
        <div className="bh-input-container">
          <span className="bh-input-leading-icon"><User size={18} /></span>
          <input id="nome" name="nome" type="text" className="bh-input-field" autoComplete="name" placeholder="Seu nome completo"
            value={valores.nome} onChange={alterar} maxLength={150} autoFocus
            aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'nome-erro' : undefined} />
        </div>
        <MensagemErro id="nome-erro" texto={erros.nome} />
      </div>

      <div className="bh-input-group">
        <label htmlFor="email">E-mail</label>
        <div className="bh-input-container">
          <span className="bh-input-leading-icon"><Mail size={18} /></span>
          <input id="email" name="email" type="email" className="bh-input-field" autoComplete="username" inputMode="email" placeholder="voce@exemplo.com"
            value={valores.email} onChange={alterar} maxLength={254}
            aria-invalid={!!erros.email} aria-describedby={erros.email ? 'email-erro' : undefined} />
        </div>
        <MensagemErro id="email-erro" texto={erros.email} />
      </div>

      <div className="bh-input-group">
        <label htmlFor="senha">Senha</label>
        <PasswordField id="senha" name="senha" autoComplete="new-password" placeholder="Mínimo de 8 caracteres"
          value={valores.senha} onChange={alterar} error={erros.senha} />
        <MensagemErro id="senha-erro" texto={erros.senha} />
      </div>

      <div className="bh-input-group">
        <label htmlFor="confirmarSenha">Confirmar senha</label>
        <PasswordField id="confirmarSenha" name="confirmarSenha" autoComplete="new-password" placeholder="Repita a senha"
          value={valores.confirmarSenha} onChange={alterar} error={erros.confirmarSenha} />
        <MensagemErro id="confirmarSenha-erro" texto={erros.confirmarSenha} />
      </div>

      <button type="submit" className="bh-btn-submit" disabled={enviando} aria-busy={enviando}>
        {enviando ? (
          <>
            <span className="bh-spinner-ring" aria-hidden="true" />
            <span>Criando sua conta…</span>
          </>
        ) : (
          <>
            <span>Criar conta</span>
            <ArrowRight size={18} className="bh-btn-arrow" />
          </>
        )}
      </button>
    </form>
  );
}
