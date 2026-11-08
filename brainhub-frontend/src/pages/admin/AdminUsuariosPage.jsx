import { useState } from 'react';
import PasswordField from '../../components/auth/PasswordField.jsx';
import { criarUsuario } from '../../services/admin/usuariosAdminService.js';
import { validarCadastro } from '../../validators/auth/registerValidator.js';
import { mensagemErroCadastro } from '../../utils/mensagensCadastro.js';

const VAZIO = { nome: '', email: '', senha: '', confirmacao: '', perfil: 'ALUNO' };

export default function AdminUsuariosPage() {
  const [v, setV] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [criado, setCriado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => { setV(x => ({ ...x, [e.target.name]: e.target.value })); setCriado(null); if (erros[e.target.name]) setErros(x => ({ ...x, [e.target.name]: undefined })); };

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    const novos = validarCadastro(v);
    setErros(novos);
    if (Object.keys(novos).length) return;
    setEnviando(true); setErroGeral('');
    try {
      setCriado(await criarUsuario({ nome: v.nome.trim(), email: v.email.trim(), senha: v.senha, perfil: v.perfil }));
      setV(VAZIO);
    } catch (err) { setErroGeral(mensagemErroCadastro(err)); }
    finally { setEnviando(false); }
  }

  return (
    <>
      <div className="page-head">
        <h1>Usuários</h1>
        <p>Crie contas de aluno ou de administrador. O back ainda não tem listagem de usuários.</p>
      </div>
      {erroGeral && <div className="alert" role="alert">{erroGeral}</div>}
      {criado && <div className="sucesso" role="status">Usuário {criado.nome} ({criado.perfil === 'ADMINISTRADOR' ? 'administrador' : 'aluno'}) criado com o e-mail {criado.email}.</div>}

      <form onSubmit={enviar} noValidate className="painel form-grade">
        <div className="field">
          <label htmlFor="u-nome">Nome</label>
          <input id="u-nome" name="nome" value={v.nome} onChange={alterar} maxLength={150} aria-invalid={!!erros.nome} />
          {erros.nome && <p className="field-error">{erros.nome}</p>}
        </div>
        <div className="field">
          <label htmlFor="u-email">E-mail</label>
          <input id="u-email" name="email" type="email" value={v.email} onChange={alterar} maxLength={254} aria-invalid={!!erros.email} />
          {erros.email && <p className="field-error">{erros.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="senha">Senha</label>
          <PasswordField id="senha" name="senha" autoComplete="new-password" value={v.senha} onChange={alterar} error={erros.senha} maxLength={128} />
          {erros.senha && <p className="field-error">{erros.senha}</p>}
        </div>
        <div className="field">
          <label htmlFor="confirmacao">Confirmar senha</label>
          <PasswordField id="confirmacao" name="confirmacao" autoComplete="new-password" value={v.confirmacao} onChange={alterar} error={erros.confirmacao} maxLength={128} />
          {erros.confirmacao && <p className="field-error">{erros.confirmacao}</p>}
        </div>
        <div className="field">
          <label htmlFor="u-perfil">Perfil</label>
          <select id="u-perfil" name="perfil" value={v.perfil} onChange={alterar}>
            <option value="ALUNO">Aluno</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </select>
        </div>
        <div className="linha-acoes campo-largo">
          <button type="submit" className="btn btn-primary btn-inline" disabled={enviando}>{enviando ? 'Criando…' : 'Criar usuário'}</button>
        </div>
      </form>
    </>
  );
}
