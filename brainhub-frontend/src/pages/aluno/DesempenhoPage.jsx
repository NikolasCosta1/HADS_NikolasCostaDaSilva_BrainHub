import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltrosQuestoes from '../../components/questoes/FiltrosQuestoes.jsx';
import Paginacao from '../../components/questoes/Paginacao.jsx';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { listarDisciplinas, listarAssuntos } from '../../services/disciplinas/disciplinasService.js';
import { buscarDesempenhoPorAssunto } from '../../services/relatorios/relatoriosService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const LIMITE = 10;

function CardResumo({ titulo, valor }) {
  return (
    <div className="card-resumo">
      <span className="card-resumo-valor">{valor}</span>
      <span className="card-resumo-titulo">{titulo}</span>
    </div>
  );
}

export default function DesempenhoPage() {
  const [params, setParams] = useSearchParams();
  const idDisciplina = params.get('disciplina') || '';
  const idAssunto = params.get('assunto') || '';
  const page = Math.max(1, Number(params.get('pagina')) || 1);

  const [disciplinas, setDisciplinas] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [carregandoAssuntos, setCarregandoAssuntos] = useState(false);
  const [itens, setItens] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarDisciplinas()
      .then(lista => { if (ativo) setDisciplinas(lista); })
      .catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!idDisciplina) { setAssuntos([]); return undefined; }
    let ativo = true;
    setCarregandoAssuntos(true);
    listarAssuntos(idDisciplina)
      .then(lista => { if (ativo) setAssuntos(lista); })
      .catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); })
      .finally(() => { if (ativo) setCarregandoAssuntos(false); });
    return () => { ativo = false; };
  }, [idDisciplina]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    buscarDesempenhoPorAssunto({ idDisciplina, idAssunto, page, limit: LIMITE })
      .then(data => { if (ativo) { setItens(data.items); setResumo(data.resumo); } })
      .catch(err => { if (ativo) { setItens([]); setErro(mensagemErroQuestao(err)); } })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [idDisciplina, idAssunto, page]);

  function alterarFiltro(campo, valor) {
    const proximo = new URLSearchParams(params);
    if (valor) proximo.set(campo, valor); else proximo.delete(campo);
    if (campo === 'disciplina') proximo.delete('assunto');
    proximo.delete('pagina');
    setParams(proximo);
  }

  function irParaPagina(numero) {
    const proximo = new URLSearchParams(params);
    proximo.set('pagina', String(numero));
    setParams(proximo);
  }

  return (
    <>
      <div className="page-head">
        <h1>Desempenho por assunto</h1>
        <p>Veja seu aproveitamento nos assuntos que você já praticou.</p>
      </div>

      {resumo && (
        <div className="resumo-grid">
          <CardResumo titulo="Assuntos praticados" valor={resumo.assuntos_praticados} />
          <CardResumo titulo="Questões respondidas" valor={resumo.total_respondidas} />
          <CardResumo titulo="Acertos" valor={resumo.total_acertos} />
          <CardResumo titulo="Aproveitamento geral" valor={`${resumo.aproveitamento_geral}%`} />
        </div>
      )}

      <FiltrosQuestoes
        disciplinas={disciplinas}
        assuntos={assuntos}
        idDisciplina={idDisciplina}
        idAssunto={idAssunto}
        carregandoAssuntos={carregandoAssuntos}
        onChange={alterarFiltro}
      />

      {erro && <div className="alert" role="alert">{erro}</div>}

      {carregando ? (
        <TelaCarregando texto="Carregando desempenho…" />
      ) : itens.length === 0 ? (
        <div className="vazio">Você ainda não respondeu questões neste filtro.</div>
      ) : (
        <div className="tabela-wrap">
          <table className="tabela-desempenho">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Assunto</th>
                <th>Tentativas</th>
                <th>Acertos</th>
                <th>Erros</th>
                <th>Aproveitamento</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id_assunto}>
                  <td>{item.disciplina}</td>
                  <td>{item.assunto}</td>
                  <td>{item.tentativas}</td>
                  <td>{item.acertos}</td>
                  <td>{item.erros}</td>
                  <td>
                    <span className={`aproveitamento ${item.aproveitamento < 50 ? 'aproveitamento--baixo' : item.aproveitamento >= 80 ? 'aproveitamento--alto' : ''}`}>
                      {item.aproveitamento}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Paginacao page={page} temProxima={itens.length === LIMITE} desabilitada={carregando} onChange={irParaPagina} />
    </>
  );
}
