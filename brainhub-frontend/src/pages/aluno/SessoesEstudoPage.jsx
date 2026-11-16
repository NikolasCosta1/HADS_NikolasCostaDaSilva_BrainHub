import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import SessaoForm from '../../components/sessoes/SessaoForm.jsx';
import { listarSessoes, criarSessao, atualizarSessao, removerSessao } from '../../services/sessoes/sessoesService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

function formatarData(data) {
  if (!data) return '';
  try { return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR'); } catch { return data; }
}

export default function SessoesEstudoPage() {
  const [sessoes, setSessoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(null); // null = nova, objeto = edição
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarSessoes()
      .then(lista => { if (ativo) setSessoes(lista); })
      .catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  function abrirNova() {
    setEditando(null);
    setMostrarForm(true);
  }
  function abrirEdicao(sessao) {
    setEditando(sessao);
    setMostrarForm(true);
  }
  async function salvar(dados) {
    setErro('');
    try {
      if (editando) {
        const salva = await atualizarSessao(editando.id_sessao, dados);
        setSessoes(l => l.map(s => (s.id_sessao === salva.id_sessao ? salva : s)));
      } else {
        const salva = await criarSessao(dados);
        setSessoes(l => [salva, ...l].sort((a, b) => (b.data || '').localeCompare(a.data || '')));
      }
      setMostrarForm(false);
      setEditando(null);
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    }
  }
  async function remover(id) {
    if (!window.confirm('Remover esta sessão de estudo?')) return;
    setErro('');
    try {
      await removerSessao(id);
      setSessoes(l => l.filter(s => s.id_sessao !== id));
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Sessões de estudo</h1>
        <p>Registre o que você estudou, por quanto tempo e os materiais usados.</p>
      </div>

      {erro && <div className="alert" role="alert">{erro}</div>}

      {!mostrarForm && (
        <div className="acoes">
          <button type="button" className="btn btn-primary btn-inline" onClick={abrirNova}><Plus size={18} />Nova sessão</button>
        </div>
      )}

      {mostrarForm && (
        <div className="card-painel">
          <SessaoForm sessaoInicial={editando} onSalvar={salvar} onCancelar={() => { setMostrarForm(false); setEditando(null); }} />
        </div>
      )}

      {carregando ? (
        <TelaCarregando texto="Carregando sessões…" />
      ) : sessoes.length === 0 ? (
        <div className="vazio">Nenhuma sessão registrada ainda.</div>
      ) : (
        <ul className="lista-sessoes">
          {sessoes.map(s => (
            <li key={s.id_sessao} className="card-sessao">
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
                  <button type="button" className="btn-link btn-link-danger" onClick={() => remover(s.id_sessao)}>Remover</button>
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
