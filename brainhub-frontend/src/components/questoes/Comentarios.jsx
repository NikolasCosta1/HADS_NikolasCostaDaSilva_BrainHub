import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  criarComentario, editarComentario, listarComentarios, removerComentario,
} from '../../services/questoes/comentariosService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';
import { formatarData } from '../../utils/formatar.js';

const LIMITE = 3000;

export default function Comentarios({ idQuestao }) {
  const { usuario } = useAuth();
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [novo, setNovo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(null); // { id, texto }

  const carregar = useCallback(async () => {
    setErro('');
    try { setItens((await listarComentarios(idQuestao)).items); }
    catch (err) { setErro(mensagemErroQuestao(err)); }
    finally { setCarregando(false); }
  }, [idQuestao]);

  useEffect(() => { setCarregando(true); setEditando(null); setNovo(''); carregar(); }, [carregar]);

  // O back só deixa editar/remover o que é seu (ou tudo, se for administrador).
  const podeMexer = (c) => String(c.id_usuario) === String(usuario.id_usuario) || usuario.perfil === 'ADMINISTRADOR';

  async function executar(acao) {
    setEnviando(true);
    setErro('');
    try { await acao(); await carregar(); }
    catch (err) { setErro(mensagemErroQuestao(err)); }
    finally { setEnviando(false); }
  }

  const enviarNovo = (e) => {
    e.preventDefault();
    if (!novo.trim()) { setErro('Escreva o comentário antes de enviar.'); return; }
    executar(async () => { await criarComentario(idQuestao, novo.trim()); setNovo(''); });
  };
  const salvarEdicao = (e) => {
    e.preventDefault();
    if (!editando.texto.trim()) { setErro('O comentário não pode ficar vazio.'); return; }
    executar(async () => { await editarComentario(idQuestao, editando.id, editando.texto.trim()); setEditando(null); });
  };
  const remover = (c) => {
    if (!window.confirm('Remover este comentário?')) return;
    executar(() => removerComentario(idQuestao, c.id_comentario));
  };

  return (
    <section className="comentarios" aria-labelledby="titulo-comentarios">
      <h2 id="titulo-comentarios">Comentários {!carregando && <span className="contagem">({itens.length})</span>}</h2>

      {erro && <div className="alert" role="alert">{erro}</div>}

      {carregando ? (
        <div className="tela-carregando carregando-bloco"><span className="spinner" aria-hidden="true" /> Carregando comentários…</div>
      ) : itens.length === 0 ? (
        <p className="vazio">Ninguém comentou ainda. Seja a primeira pessoa.</p>
      ) : (
        <ul className="lista-comentarios">
          {itens.map(c => (
            <li key={c.id_comentario} className="comentario">
              <div className="comentario-cab">
                <strong>{c.autor}</strong>
                <span>{formatarData(c.criado_em)}{c.atualizado_em && c.atualizado_em !== c.criado_em ? ' · editado' : ''}</span>
              </div>
              {editando?.id === c.id_comentario ? (
                <form onSubmit={salvarEdicao} className="form-comentario">
                  <label className="sr-only" htmlFor={`edit-${c.id_comentario}`}>Editar comentário</label>
                  <textarea id={`edit-${c.id_comentario}`} rows={3} maxLength={LIMITE} value={editando.texto}
                    onChange={e => setEditando({ ...editando, texto: e.target.value })} />
                  <div className="linha-acoes">
                    <button type="submit" className="btn btn-primary btn-sm btn-inline" disabled={enviando}>Salvar</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditando(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="comentario-texto">{c.texto}</p>
                  {podeMexer(c) && (
                    <div className="linha-acoes">
                      <button type="button" className="btn-link" onClick={() => setEditando({ id: c.id_comentario, texto: c.texto })}>Editar</button>
                      <button type="button" className="btn-link btn-link--perigo" onClick={() => remover(c)} disabled={enviando}>Remover</button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={enviarNovo} className="form-comentario">
        <label htmlFor="novo-comentario">Adicionar comentário</label>
        <textarea id="novo-comentario" rows={3} maxLength={LIMITE} placeholder="Compartilhe uma dica ou dúvida sobre esta questão"
          value={novo} onChange={e => { setNovo(e.target.value); if (erro) setErro(''); }} />
        <div className="linha-acoes">
          <button type="submit" className="btn btn-primary btn-sm btn-inline" disabled={enviando}>{enviando ? 'Enviando…' : 'Comentar'}</button>
          <span className="contador">{novo.length}/{LIMITE}</span>
        </div>
      </form>
    </section>
  );
}
