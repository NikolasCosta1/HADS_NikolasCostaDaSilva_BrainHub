import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Paginacao from '../../components/questoes/Paginacao.jsx';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { buscarDesempenho } from '../../services/relatorios/desempenhoService.js';
import { listarDisciplinas } from '../../services/disciplinas/disciplinasService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';
import { formatarDia, formatarPercentual } from '../../utils/formatar.js';

const LIMITE = 10;

export default function DesempenhoPage() {
  const [params, setParams] = useSearchParams();
  const idDisciplina = params.get('disciplina') || '';
  const page = Math.max(1, Number(params.get('pagina')) || 1);

  const [disciplinas, setDisciplinas] = useState([]);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarDisciplinas().then(l => { if (ativo) setDisciplinas(l); }).catch(() => { /* o filtro só fica vazio */ });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    buscarDesempenho({ idDisciplina, page, limit: LIMITE })
      .then(d => { if (ativo) setDados(d); })
      .catch(err => { if (ativo) { setDados(null); setErro(mensagemErroQuestao(err)); } })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [idDisciplina, page]);

  function alterarDisciplina(valor) {
    const p = new URLSearchParams(params);
    if (valor) p.set('disciplina', valor); else p.delete('disciplina');
    p.delete('pagina');
    setParams(p);
  }
  function irParaPagina(n) { const p = new URLSearchParams(params); p.set('pagina', String(n)); setParams(p); }

  const r = dados?.resumo;
  const itens = dados?.items ?? [];

  return (
    <>
      <div className="page-head">
        <h1>Meu desempenho</h1>
        <p>Veja em quais assuntos você mais erra. Os piores aparecem primeiro.</p>
      </div>

      <div className="filtros">
        <div className="select-field">
          <label htmlFor="desempenho-disciplina">Disciplina</label>
          <select id="desempenho-disciplina" value={idDisciplina} onChange={e => alterarDisciplina(e.target.value)}>
            <option value="">Todas as disciplinas</option>
            {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nome}</option>)}
          </select>
        </div>
      </div>

      {erro && <div className="alert" role="alert">{erro}</div>}

      {r && (
        <div className="resumo-cards">
          <div className="resumo-card"><span>Respondidas</span><strong>{r.total_respondidas}</strong></div>
          <div className="resumo-card"><span>Acertos</span><strong>{r.total_acertos}</strong></div>
          <div className="resumo-card"><span>Erros</span><strong>{r.total_erros}</strong></div>
          <div className="resumo-card"><span>Aproveitamento</span><strong>{formatarPercentual(r.aproveitamento_geral)}</strong></div>
          <div className="resumo-card"><span>Assuntos praticados</span><strong>{r.assuntos_praticados}</strong></div>
        </div>
      )}

      {carregando ? <TelaCarregando texto="Calculando seu desempenho…" /> : itens.length === 0 && !erro ? (
        <div className="vazio">Você ainda não respondeu questões{idDisciplina ? ' desta disciplina' : ''}. Resolva algumas para ver o relatório.</div>
      ) : (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr><th>Assunto</th><th>Tentativas</th><th>Acertos</th><th>Erros</th><th>Aproveitamento</th><th>Última resposta</th></tr>
            </thead>
            <tbody>
              {itens.map(i => {
                const ap = Number(i.aproveitamento) || 0;
                return (
                  <tr key={i.id_assunto}>
                    <td><strong>{i.assunto}</strong><br /><small>{i.disciplina}</small></td>
                    <td>{i.tentativas}</td>
                    <td>{i.acertos}</td>
                    <td>{i.erros}</td>
                    <td>
                      <div className="barra" role="img" aria-label={`Aproveitamento de ${formatarPercentual(ap)}`}>
                        <div className={`barra-preenchida ${ap < 50 ? 'barra--ruim' : ap < 70 ? 'barra--media' : 'barra--boa'}`} style={{ width: `${Math.min(100, ap)}%` }} />
                      </div>
                      {formatarPercentual(ap)}
                    </td>
                    <td>{formatarDia(i.ultima_resposta)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Paginacao page={page} temProxima={itens.length === LIMITE} desabilitada={carregando} onChange={irParaPagina} />
    </>
  );
}
