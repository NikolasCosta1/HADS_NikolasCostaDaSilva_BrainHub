import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HtmlSanitizado from '../../components/common/HtmlSanitizado.jsx';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import {
  listarCaderno, listarErradasSemAnotacao, salvarNoCaderno, atualizarAnotacao, removerDoCaderno,
} from '../../services/questoes/cadernoService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';
import '../../styles/anotacoes.css';

const LIMITE = 3000;

function formatarData(iso) {
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return ''; }
}

// Painel "Nova anotação": o aluno escolhe uma questão que errou (e ainda não anotou) e escreve o motivo.
function NovaAnotacao({ onSalva, onCancelar }) {
  const [erradas, setErradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [escolhida, setEscolhida] = useState(null);
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarErradasSemAnotacao()
      .then(({ items }) => { if (ativo) setErradas(items); })
      .catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  async function salvar(e) {
    e.preventDefault();
    if (!escolhida) { setErro('Escolha a questão que você errou.'); return; }
    if (!texto.trim()) { setErro('Escreva a anotação antes de salvar.'); return; }
    setSalvando(true);
    setErro('');
    try {
      await salvarNoCaderno(escolhida.id_questao, escolhida.id_resposta, texto.trim());
      onSalva();
    } catch (err) {
      setErro(mensagemErroQuestao(err));
      setSalvando(false);
    }
  }

  return (
    <form className="card-painel nova-anotacao" onSubmit={salvar}>
      <h3>Nova anotação</h3>
      {carregando ? (
        <TelaCarregando texto="Buscando questões que você errou…" />
      ) : erradas.length === 0 ? (
        <p className="comentarios-vazio">Você não tem questões erradas sem anotação. Erre (ou refaça) uma questão em <Link to="/aluno/questoes">Questões</Link> para anotar.</p>
      ) : (
        <>
          <p className="anotacao-dica">Escolha a questão que você errou:</p>
          <ul className="lista-erradas">
            {erradas.map(q => (
              <li key={q.id_questao}>
                <label className={`errada-opcao ${escolhida?.id_questao === q.id_questao ? 'errada-opcao--ativa' : ''}`}>
                  <input type="radio" name="errada" checked={escolhida?.id_questao === q.id_questao} onChange={() => setEscolhida(q)} />
                  <span>
                    <span className="errada-meta">{q.disciplina} · {q.assunto} · você marcou {q.respostaErrada}</span>
                    <HtmlSanitizado html={q.enunciado} as="span" className="errada-enunciado" />
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="field">
            <label htmlFor="nova-anotacao-texto">Por que você errou?</label>
            <textarea id="nova-anotacao-texto" rows={4} maxLength={LIMITE} value={texto} onChange={e => setTexto(e.target.value)} disabled={salvando} />
          </div>
        </>
      )}
      {erro && <p className="field-error" role="alert">{erro}</p>}
      <div className="acoes">
        {erradas.length > 0 && <button type="submit" className="btn btn-primary btn-inline" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar anotação'}</button>}
        <button type="button" className="btn btn-secondary btn-inline" onClick={onCancelar} disabled={salvando}>Cancelar</button>
      </div>
    </form>
  );
}

function ItemAnotacao({ item, onMudou }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(item.anotacao || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const escolhida = (item.alternativas || []).find(a => a.codigo === item.respostaErrada);
  const prova = item.metadados_fonte?.provas?.[0] || {};

  async function salvar() {
    setSalvando(true);
    setErro('');
    try {
      await atualizarAnotacao(item.id_questao, texto.trim());
      setEditando(false);
      onMudou();
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!window.confirm('Excluir esta anotação? Faça isso quando já tiver revisado a questão.')) return;
    try {
      await removerDoCaderno(item.id_questao);
      onMudou();
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    }
  }

  return (
    <li className="card-anotacao">
      <div className="card-meta">
        <span className="badge">{item.disciplina}</span>
        <span>{item.assunto}</span>
        {prova.banca && <span className="chip">{prova.banca}</span>}
        {prova.ano && <span className="chip">{prova.ano}</span>}
        <span className="anotacao-data">Anotada em {formatarData(item.atualizado_em || item.criado_em)}</span>
      </div>

      <HtmlSanitizado html={item.enunciado} as="div" className="card-anotacao-enunciado" />
      <p className="card-anotacao-resposta">
        Você marcou <strong>{item.respostaErrada}</strong>{textoDaAlternativa(escolhida)} · Gabarito: <strong>{item.gabarito}</strong>
      </p>

      {editando ? (
        <div className="comentario-edicao">
          <textarea value={texto} onChange={e => setTexto(e.target.value)} maxLength={LIMITE} rows={4} disabled={salvando} />
          <div className="comentario-acoes">
            <button type="button" className="btn btn-primary btn-sm" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditando(false); setTexto(item.anotacao || ''); setErro(''); }} disabled={salvando}>Cancelar</button>
          </div>
        </div>
      ) : (
        <blockquote className="card-anotacao-texto">
          {item.anotacao ? item.anotacao : <em>Sem anotação. Clique em editar para escrever o que errou.</em>}
        </blockquote>
      )}
      {erro && <p className="field-error" role="alert">{erro}</p>}

      <div className="comentario-acoes">
        <Link to={`/aluno/questoes/${item.id_questao}`} className="btn-link">Refazer questão</Link>
        {!editando && <button type="button" className="btn-link" onClick={() => setEditando(true)}>Editar</button>}
        <button type="button" className="btn-link btn-link-danger" onClick={excluir}>Excluir</button>
      </div>
    </li>
  );
}

// Texto da alternativa marcada (vem com HTML em questões importadas, então vira texto simples só para o resumo).
function textoDaAlternativa(alt) {
  if (!alt?.texto) return '';
  const simples = String(alt.texto).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return simples ? ` (${simples.length > 80 ? `${simples.slice(0, 80)}…` : simples})` : '';
}

export default function AnotacoesPage() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(() => {
    setErro('');
    return listarCaderno()
      .then(({ items }) => setItens(items))
      .catch(err => setErro(mensagemErroQuestao(err)))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <>
      <div className="page-head page-head-acao">
        <div>
          <h1>Anotações de revisão</h1>
          <p>O que você errou e o motivo. Exclua cada anotação depois de revisar.</p>
        </div>
        {!criando && <button type="button" className="btn btn-primary btn-inline" onClick={() => setCriando(true)}>+ Nova anotação</button>}
      </div>

      {criando && <NovaAnotacao onSalva={() => { setCriando(false); carregar(); }} onCancelar={() => setCriando(false)} />}

      {erro && <div className="alert" role="alert">{erro}</div>}

      {carregando ? (
        <TelaCarregando texto="Carregando anotações…" />
      ) : itens.length === 0 ? (
        <div className="vazio">Nenhuma anotação ainda. Quando você errar uma questão, escreva o motivo para revisar depois.</div>
      ) : (
        <ul className="lista-anotacoes">
          {itens.map(item => <ItemAnotacao key={item.id_questao} item={item} onMudou={carregar} />)}
        </ul>
      )}
    </>
  );
}
