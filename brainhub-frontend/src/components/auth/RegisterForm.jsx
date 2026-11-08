import { useState } from 'react';
import PasswordField from './PasswordField.jsx';
import { validarCadastro } from '../../validators/auth/registerValidator.js';
import { mensagemErroCadastro } from '../../utils/mensagensCadastro.js';

const ORDEM = ['nome', 'email', 'senha', 'confirmacao'];

export default function RegisterForm({ onSubmit }) {
  const [valores, setValores] = useState({ nome: '', email: '', senha: '', confirmacao: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => {
    const { name, value } = e.target;
    setValores(v => ({ ...v, [name]: value }));
    if (erros[name]) setErros(x => ({ ...x, [name]: undefined }));
    if (erroGeral) setErroGeral('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    const novos = validarCadastro(valores);
    setErros(novos);
    const primeiro = ORDEM.find(c => novos[c]);
    if (primeiro) { document.getElementById(primeiro)?.focus(); return; }
    setEnviando(true);
    setErroGeral('');
    try {
      await onSubmit({ nome: valores.nome.trim(), email: valores.email.trim(), senha: valores.senha });
    } catch (err) {
      setErroGeral(err.status !== undefined ? mensagemErroCadastro(err) : 'Não foi possível concluir o cadastro. Tente novamente.');
      setValores(v => ({ ...v, senha: '', confirmacao: '' }));
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="form">
      <div className="alert" role="alert" hidden={!erroGeral}>{erroGeral}</div>

      <div className="field">
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" type="text" autoComplete="name" placeholder="Seu nome completo" maxLength={150}
          value={valores.nome} onChange={alterar} autoFocus
          aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'nome-erro' : undefined} />
        {erros.nome && <p className="field-error" id="nome-erro">{erros.nome}</p>}
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="voce@exemplo.com" maxLength={254}
          value={valores.email} onChange={alterar}
          aria-invalid={!!erros.email} aria-describedby={erros.email ? 'email-erro' : undefined} />
        {erros.email && <p className="field-error" id="email-erro">{erros.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="senha">Senha</label>
        <PasswordField id="senha" name="senha" autoComplete="new-password" placeholder="De 8 a 128 caracteres" maxLength={128}
          value={valores.senha} onChange={alterar} error={erros.senha} />
        {erros.senha && <p className="field-error" id="senha-erro">{erros.senha}</p>}
      </div>

      <div className="field">
        <label htmlFor="confirmacao">Confirmar senha</label>
        <PasswordField id="confirmacao" name="confirmacao" autoComplete="new-password" placeholder="Repita a senha" maxLength={128}
          value={valores.confirmacao} onChange={alterar} error={erros.confirmacao} />
        {erros.confirmacao && <p className="field-error" id="confirmacao-erro">{erros.confirmacao}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? <><span className="spinner" aria-hidden="true" /> Criando conta…</> : 'Criar conta'}
      </button>
    </form>
  );
}
