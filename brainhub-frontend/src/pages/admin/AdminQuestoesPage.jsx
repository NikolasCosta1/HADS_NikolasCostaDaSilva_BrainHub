import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import FiltrosQuestoes from '../../components/questoes/FiltrosQuestoes.jsx';
import Paginacao from '../../components/questoes/Paginacao.jsx';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { listarDisciplinasAdmin, listarAssuntosAdmin } from '../../services/admin/catalogoAdminService.js';
import { listarQuestoesAdmin, inativarQuestao } from '../../services/admin/adminQuestoesService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';
import { textoSimples } from '../../utils/sanitizar.js';
import { resumoOrigem } from '../../utils/origemQuestao.js';

const LIMITE = 10;

export default function AdminQuestoesPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const idDisciplina = params.get('disciplina') || '';
  const idAssunto = params.get('assunto') || '';
  const page = Math.max(1, Number(params.get('pagina')) || 1);

  const [disciplinas, setDisciplinas] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [questoes, setQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let ativo = true;
    listarDisciplinasAdmin().then(l => { if (ativo) setDisciplinas(l); }).catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!idDisciplina) { setAssuntos([]); return undefined; }
    let ativo = true;
    listarAssuntosAdmin(idDisciplina).then(l => { if (ativo) setAssuntos(l); }).catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); });
    return () => { ativo = false; };
  }, [idDisciplina]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    listarQuestoesAdmin({ idDisciplina, idAssunto, page, limit: LIMITE })
      .then(d => { if (ativo) setQuestoes(d.items); })
      .catch(err => { if (ativo) { setQuestoes([]); setErro(mensagemErroQuestao(err)); } })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [idDisciplina, idAssunto, page, recarga]);

  function alterarFiltro(campo, valor) {
    const p = new URLSearchParams(params);
    if (valor) p.set(campo, valor); else p.delete(campo);
    if (campo === 'disciplina') p.delete('assunto');
    p.delete('pagina');
    setParams(p);
  }
  function irParaPagina(n) { const p = new URLSearchParams(params); p.set('pagina', String(n)); setParams(p); }

  async function inativar(q) {
    if (!window.confirm('Inativar esta questão? Ela deixa de aparecer para os alunos, mas o histórico de respostas é mantido.')) return;
    try { await inativarQuestao(q.id_questao); setRecarga(n => n + 1); }
    catch (err) { setErro(mensagemErroQuestao(err)); }
  }

  const voltarPara = `${location.pathname}${location.search}`;

  return (
    <>
      <div className="page-head page-head--acao">
        <div>
          <h1>Banco de questões</h1>
          <p>Questões locais e importadas, ativas e inativas.</p>
        </div>
        <Link to="/admin/questoes/nova" className="btn btn-primary btn-inline" state={{ voltarPara }}>Nova questão</Link>
      </div>

      <FiltrosQuestoes disciplinas={disciplinas} assuntos={assuntos} idDisciplina={idDisciplina} idAssunto={idAssunto} onChange={alterarFiltro} />
      {erro && <div className="alert" role="alert">{erro}</div>}

      {carregando ? <TelaCarregando texto="Carregando questões…" /> : questoes.length === 0 ? (
        <div className="vazio">Nenhuma questão encontrada para este filtro.</div>
      ) : (
        <ul className="lista-questoes">
          {questoes.map(q => (
            <li key={q.id_questao} className={`card-questao card-questao--admin ${q.ativa ? '' : 'card-questao--inativa'}`}>
              <div className="card-meta">
                <span className="badge">{q.disciplina}</span>
                <span>{q.assunto}</span>
                <span>#{q.id_questao}</span>
                <span className={q.ativa ? 'status status--ok' : 'status status--off'}>{q.ativa ? 'Ativa' : 'Inativa'}</span>
                {resumoOrigem(q) ? <span>{resumoOrigem(q)}</span> : <span>Local</span>}
              </div>
              <p className="card-enunciado">{textoSimples(q.enunciado)}</p>
              <div className="linha-acoes">
                <Link className="btn-link" to={`/admin/questoes/${q.id_questao}/editar`} state={{ voltarPara }}>Editar</Link>
                {q.ativa && <button type="button" className="btn-link btn-link--perigo" onClick={() => inativar(q)}>Inativar</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Paginacao page={page} temProxima={questoes.length === LIMITE} desabilitada={carregando} onChange={irParaPagina} />
    </>
  );
}
