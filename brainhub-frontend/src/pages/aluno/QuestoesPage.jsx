import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import FiltrosQuestoes from '../../components/questoes/FiltrosQuestoes.jsx';
import CardQuestao from '../../components/questoes/CardQuestao.jsx';
import Paginacao from '../../components/questoes/Paginacao.jsx';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { listarDisciplinas, listarAssuntos } from '../../services/disciplinas/disciplinasService.js';
import { listarQuestoes, listarOpcoesFiltro } from '../../services/questoes/questoesService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const LIMITE = 10;

export default function QuestoesPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  // Filtros e página ficam na URL: ao voltar da questão, a lista continua igual.
  const idDisciplina = params.get('disciplina') || '';
  const idAssunto = params.get('assunto') || '';
  const banca = params.get('banca') || '';
  const ano = params.get('ano') || '';
  const page = Math.max(1, Number(params.get('pagina')) || 1);

  const [disciplinas, setDisciplinas] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [carregandoAssuntos, setCarregandoAssuntos] = useState(false);
  const [opcoes, setOpcoes] = useState({ bancas: [], anos: [] });
  const [questoes, setQuestoes] = useState([]);
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
    let ativo = true;
    listarOpcoesFiltro().then(o => { if (ativo) setOpcoes(o); }).catch(() => {});
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
    listarQuestoes({ idDisciplina, idAssunto, banca, ano, page, limit: LIMITE })
      .then(data => { if (ativo) setQuestoes(data.items); })
      .catch(err => { if (ativo) { setQuestoes([]); setErro(mensagemErroQuestao(err)); } })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [idDisciplina, idAssunto, banca, ano, page]);

  function alterarFiltro(campo, valor) {
    const proximo = new URLSearchParams(params);
    if (valor) proximo.set(campo, valor); else proximo.delete(campo);
    if (campo === 'disciplina') proximo.delete('assunto');
    proximo.delete('pagina');
    setParams(proximo);
  }

  function limparFiltros() {
    setParams(new URLSearchParams());
  }

  function irParaPagina(numero) {
    const proximo = new URLSearchParams(params);
    proximo.set('pagina', String(numero));
    setParams(proximo);
  }

  return (
    <>
      <div className="page-head">
        <h1>Banco de questões</h1>
        <p>Filtre por disciplina, assunto, banca e ano e resolva questões.</p>
      </div>

      <div className="questoes-layout">
        <aside className="painel-filtros" aria-label="Filtros">
          <h2>Filtros</h2>
          <FiltrosQuestoes
            disciplinas={disciplinas}
            assuntos={assuntos}
            idDisciplina={idDisciplina}
            idAssunto={idAssunto}
            carregandoAssuntos={carregandoAssuntos}
            bancas={opcoes.bancas}
            anos={opcoes.anos}
            banca={banca}
            ano={ano}
            onChange={alterarFiltro}
            onLimpar={limparFiltros}
          />
        </aside>

        <section className="questoes-resultados">
          {erro && <div className="alert" role="alert">{erro}</div>}

          {carregando ? (
            <TelaCarregando texto="Carregando questões…" />
          ) : questoes.length === 0 ? (
            <div className="vazio">Nenhuma questão encontrada para este filtro.</div>
          ) : (
            <ul className="lista-questoes">
              {questoes.map(q => (
                <li key={q.id_questao}>
                  <CardQuestao questao={q} voltarPara={`${location.pathname}${location.search}`} />
                </li>
              ))}
            </ul>
          )}

          <Paginacao
            page={page}
            temProxima={questoes.length === LIMITE}
            desabilitada={carregando}
            onChange={irParaPagina}
          />
        </section>
      </div>
    </>
  );
}
