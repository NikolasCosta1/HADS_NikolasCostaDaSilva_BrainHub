import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FiltrosQuestoes from '../../components/questoes/FiltrosQuestoes.jsx';
import Paginacao from '../../components/questoes/Paginacao.jsx';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import HtmlSanitizado from '../../components/common/HtmlSanitizado.jsx';
import { listarDisciplinasAdmin, listarAssuntosAdmin } from '../../services/admin/catalogoAdminService.js';
import { listarQuestoesAdmin, inativarQuestao } from '../../services/admin/questoesAdminService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const LIMITE = 20;

export default function AdminQuestoesPage() {
  const [params, setParams] = useSearchParams();
  const idDisciplina = params.get('disciplina') || '';
  const idAssunto = params.get('assunto') || '';
  const page = Math.max(1, Number(params.get('pagina')) || 1);

  const [disciplinas, setDisciplinas] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [carregandoAssuntos, setCarregandoAssuntos] = useState(false);
  const [questoes, setQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarDisciplinasAdmin().then(l => { if (ativo) setDisciplinas(l); }).catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!idDisciplina) { setAssuntos([]); return undefined; }
    let ativo = true;
    setCarregandoAssuntos(true);
    listarAssuntosAdmin(idDisciplina)
      .then(l => { if (ativo) setAssuntos(l); })
      .catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); })
      .finally(() => { if (ativo) setCarregandoAssuntos(false); });
    return () => { ativo = false; };
  }, [idDisciplina]);

  function carregar() {
    setCarregando(true);
    setErro('');
    listarQuestoesAdmin({ idDisciplina, idAssunto, page, limit: LIMITE })
      .then(data => setQuestoes(data.items))
      .catch(err => { setQuestoes([]); setErro(mensagemErroQuestao(err)); })
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [idDisciplina, idAssunto, page]);

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

  async function inativar(id) {
    if (!window.confirm('Inativar esta questão? Ela deixará de aparecer para os alunos.')) return;
    try {
      await inativarQuestao(id);
      carregar();
    } catch (err) {
      window.alert(mensagemErroQuestao(err));
    }
  }

  return (
    <>
      <div className="page-head page-head-acao">
        <div>
          <h1>Banco de questões</h1>
          <p>Cadastre, edite e inative questões do banco local.</p>
        </div>
        <Link to="/admin/questoes/novo" className="btn btn-primary btn-inline">+ Nova questão</Link>
      </div>

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
        <TelaCarregando texto="Carregando questões…" />
      ) : questoes.length === 0 ? (
        <div className="vazio">Nenhuma questão encontrada para este filtro.</div>
      ) : (
        <ul className="lista-questoes">
          {questoes.map(q => (
            <li key={q.id_questao} className="card-questao-admin">
              <div className="card-meta">
                <span className="badge">{q.disciplina}</span>
                <span>{q.assunto}</span>
                {q.metadados_fonte?.provas?.[0]?.banca && <span>{q.metadados_fonte.provas[0].banca}</span>}
                <span className={`status-ponto ${q.ativa ? 'status-ponto--ativa' : 'status-ponto--inativa'}`}>
                  {q.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <HtmlSanitizado html={q.enunciado} as="p" className="card-enunciado" />
              <div className="card-questao-admin-acoes">
                <Link to={`/admin/questoes/${q.id_questao}`} className="btn-link">Editar</Link>
                {q.ativa && <button type="button" className="btn-link btn-link-danger" onClick={() => inativar(q.id_questao)}>Inativar</button>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Paginacao page={page} temProxima={questoes.length === LIMITE} desabilitada={carregando} onChange={irParaPagina} />
    </>
  );
}
