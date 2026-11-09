import { useEffect, useState } from 'react';
import SessaoForm from '../../components/sessoes/SessaoForm.jsx';
import { listarSessoes, salvarSessao, removerSessao } from '../../services/sessoes/sessoesMockService.js';

function formatarData(data) {
  if (!data) return '';
  try { return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR'); } catch { return data; }
}

export default function SessoesEstudoPage() {
  const [sessoes, setSessoes] = useState([]);
  const [editando, setEditando] = useState(null); // null = fechado, {} = nova, objeto = edição
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { setSessoes(listarSessoes()); }, []);

  function abrirNova() {
    setEditando(null);
    setMostrarForm(true);
  }
  function abrirEdicao(sessao) {
    setEditando(sessao);
    setMostrarForm(true);
  }
  function salvar(dados) {
    setSessoes(salvarSessao(dados, editando?.id));
    setMostrarForm(false);
    setEditando(null);
  }
  function remover(id) {
    if (!window.confirm('Remover esta sessão de estudo?')) return;
    setSessoes(removerSessao(id));
  }

  return (
    <>
      <div className="page-head">
        <h1>Sessões de estudo</h1>
        <p>Registre o que você estudou, por quanto tempo e os materiais usados.</p>
      </div>

      <div className="alert alert-info" role="status">
        Esta tela ainda não está conectada ao servidor: os dados ficam salvos só neste navegador.
      </div>

      {!mostrarForm && (
        <div className="acoes">
          <button type="button" className="btn btn-primary btn-inline" onClick={abrirNova}>+ Nova sessão</button>
        </div>
      )}

      {mostrarForm && (
        <div className="card-painel">
          <SessaoForm sessaoInicial={editando} onSalvar={salvar} onCancelar={() => { setMostrarForm(false); setEditando(null); }} />
        </div>
      )}

      {sessoes.length === 0 ? (
        <div className="vazio">Nenhuma sessão registrada ainda.</div>
      ) : (
        <ul className="lista-sessoes">
          {sessoes.map(s => (
            <li key={s.id} className="card-sessao">
              <div className="card-sessao-cabecalho">
                <div>
                  <h3>{s.titulo}</h3>
                  <p className="card-sessao-meta">
                    {formatarData(s.data)}
                    {s.assunto && ` · ${s.assunto}`}
                    {s.duracaoMinutos ? ` · ${s.duracaoMinutos} min` : ''}
                  </p>
                </div>
                <div className="comentario-acoes">
                  <button type="button" className="btn-link" onClick={() => abrirEdicao(s)}>Editar</button>
                  <button type="button" className="btn-link btn-link-danger" onClick={() => remover(s.id)}>Remover</button>
                </div>
              </div>

              {s.anotacoes && <p className="card-sessao-anotacoes">{s.anotacoes}</p>}

              {s.materiais?.length > 0 && (
                <ul className="lista-materiais">
                  {s.materiais.map((m, i) => (
                    <li key={i}>
                      {m.link ? <a href={m.link} target="_blank" rel="noreferrer noopener">{m.titulo || m.link}</a> : m.titulo}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
