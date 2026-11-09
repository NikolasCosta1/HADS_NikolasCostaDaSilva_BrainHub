import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { criarComentario, atualizarComentario, removerComentario } from '../../services/questoes/comentariosService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

function formatarData(iso) {
  try { return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return ''; }
}

function Comentario({ comentario, podeEditar, onSalvar, onRemover }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(comentario.texto);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar() {
    const valor = texto.trim();
    if (!valor) { setErro('O comentário não pode ficar vazio.'); return; }
    setSalvando(true);
    setErro('');
    try {
      await onSalvar(comentario.id_comentario, valor);
      setEditando(false);
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <li className="comentario">
      <div className="comentario-cabecalho">
        <span className="comentario-autor">{comentario.autor}</span>
        <span className="comentario-data">
          {formatarData(comentario.criado_em)}
          {comentario.atualizado_em !== comentario.criado_em && ' (editado)'}
        </span>
      </div>

      {editando ? (
        <div className="comentario-edicao">
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={3000} rows={3} disabled={salvando} />
          {erro && <p className="field-error">{erro}</p>}
          <div className="comentario-acoes">
            <button type="button" className="btn btn-primary btn-sm" onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditando(false); setTexto(comentario.texto); setErro(''); }} disabled={salvando}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="comentario-texto">{comentario.texto}</p>
          {podeEditar && (
            <div className="comentario-acoes">
              <button type="button" className="btn-link" onClick={() => setEditando(true)}>Editar</button>
              <button type="button" className="btn-link btn-link-danger" onClick={() => onRemover(comentario.id_comentario)}>Remover</button>
            </div>
          )}
        </>
      )}
    </li>
  );
}

export default function Comentarios({ idQuestao, comentarios, onMudar }) {
  const { usuario } = useAuth();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function enviar(e) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor) { setErro('Escreva um comentário antes de enviar.'); return; }
    setEnviando(true);
    setErro('');
    try {
      await criarComentario(idQuestao, valor);
      setTexto('');
      onMudar();
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setEnviando(false);
    }
  }

  async function salvarEdicao(idComentario, novoTexto) {
    await atualizarComentario(idQuestao, idComentario, novoTexto);
    onMudar();
  }

  async function remover(idComentario) {
    if (!window.confirm('Remover este comentário?')) return;
    try {
      await removerComentario(idQuestao, idComentario);
      onMudar();
    } catch (err) {
      window.alert(mensagemErroQuestao(err));
    }
  }

  return (
    <section className="comentarios">
      <h3>Comentários {comentarios.length > 0 && `(${comentarios.length})`}</h3>

      <form onSubmit={enviar} className="comentario-form">
        <textarea
          placeholder="Compartilhe uma dúvida ou observação sobre esta questão…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={3000}
          rows={3}
          disabled={enviando}
        />
        {erro && <p className="field-error">{erro}</p>}
        <button type="submit" className="btn btn-secondary btn-sm" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Comentar'}
        </button>
      </form>

      {comentarios.length === 0 ? (
        <p className="comentarios-vazio">Nenhum comentário ainda. Seja o primeiro a comentar.</p>
      ) : (
        <ul className="lista-comentarios">
          {comentarios.map((c) => (
            <Comentario
              key={c.id_comentario}
              comentario={c}
              podeEditar={String(c.id_usuario) === String(usuario.id_usuario) || usuario.perfil === 'ADMINISTRADOR'}
              onSalvar={salvarEdicao}
              onRemover={remover}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
