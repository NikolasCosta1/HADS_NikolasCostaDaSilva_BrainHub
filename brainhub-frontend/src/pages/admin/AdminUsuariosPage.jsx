import { useState } from 'react';
import { criarUsuario } from '../../services/admin/usuariosService.js';
import { validarUsuarioAdmin } from '../../validators/admin/usuarioAdminValidator.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const VALOR_INICIAL = { nome: '', email: '', senha: '', perfil: 'ALUNO' };

export default function AdminUsuariosPage() {
  const [valores, setValores] = useState(VALOR_INICIAL);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);
  // O back não tem endpoint de listagem de usuários ainda: mostramos só os criados nesta sessão.
  const [criadosNaSessao, setCriadosNaSessao] = useState([]);

  const alterar = (e) => setValores(v => ({ ...v, [e.target.name]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    const novosErros = validarUsuarioAdmin(valores);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setSalvando(true);
    setErroGeral('');
    try {
      const criado = await criarUsuario({ nome: valores.nome.trim(), email: valores.email.trim(), senha: valores.senha, perfil: valores.perfil });
      setCriadosNaSessao(lista => [criado, ...lista]);
      setValores(VALOR_INICIAL);
    } catch (err) {
      setErroGeral(mensagemErroQuestao(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Usuários</h1>
        <p>Cadastre alunos ou outros administradores.</p>
      </div>

      <form onSubmit={enviar} className="form usuario-admin-form">
        <div className="alert" role="alert" hidden={!erroGeral}>{erroGeral}</div>

        <div className="campos-linha">
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" type="text" maxLength={150} value={valores.nome} onChange={alterar}
              aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'nome-erro' : undefined} />
            {erros.nome && <p className="field-error" id="nome-erro">{erros.nome}</p>}
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" maxLength={254} value={valores.email} onChange={alterar}
              aria-invalid={!!erros.email} aria-describedby={erros.email ? 'email-erro' : undefined} />
            {erros.email && <p className="field-error" id="email-erro">{erros.email}</p>}
          </div>
        </div>

        <div className="campos-linha">
          <div className="field">
            <label htmlFor="senha">Senha provisória</label>
            <input id="senha" name="senha" type="text" maxLength={128} value={valores.senha} onChange={alterar} placeholder="Mínimo de 8 caracteres"
              aria-invalid={!!erros.senha} aria-describedby={erros.senha ? 'senha-erro' : undefined} />
            {erros.senha && <p className="field-error" id="senha-erro">{erros.senha}</p>}
          </div>
          <div className="select-field">
            <label htmlFor="perfil">Perfil</label>
            <select id="perfil" name="perfil" value={valores.perfil} onChange={alterar}>
              <option value="ALUNO">Aluno</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>
        </div>

        <div className="acoes">
          <button type="submit" className="btn btn-primary btn-inline" disabled={salvando}>
            {salvando ? 'Cadastrando…' : 'Cadastrar usuário'}
          </button>
        </div>
      </form>

      {criadosNaSessao.length > 0 && (
        <div className="card-painel">
          <h3>Cadastrados agora</h3>
          <ul className="lista-catalogo">
            {criadosNaSessao.map(u => (
              <li key={u.id_usuario} className="item-catalogo">
                <span className="item-catalogo-nome">{u.nome} <span className="origem-detalhes">— {u.email} · {u.perfil}</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
