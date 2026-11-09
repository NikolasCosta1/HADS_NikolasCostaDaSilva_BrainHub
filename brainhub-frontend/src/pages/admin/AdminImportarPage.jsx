import { useEffect, useState } from 'react';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import HtmlSanitizado from '../../components/common/HtmlSanitizado.jsx';
import {
  listarMateriasQuestApi, listarAssuntosQuestApi, listarBancasQuestApi, listarAnosQuestApi,
  previsualizarQuestoesQuestApi, sincronizarQuestoesQuestApi,
} from '../../services/admin/questApiAdminService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

export default function AdminImportarPage() {
  const [materias, setMaterias] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [bancas, setBancas] = useState([]);
  const [anos, setAnos] = useState([]);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);
  const [carregandoAssuntos, setCarregandoAssuntos] = useState(false);
  const [erro, setErro] = useState('');

  const [filtros, setFiltros] = useState({ materia: '', assunto: '', banca: '', ano: '' });
  const [previa, setPrevia] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    setCarregandoFiltros(true);
    setErro('');
    Promise.all([listarMateriasQuestApi(), listarBancasQuestApi(), listarAnosQuestApi()])
      .then(([mat, banc, anosResp]) => {
        setMaterias(mat.items);
        setBancas(banc.items);
        setAnos(anosResp.items);
      })
      .catch(err => setErro(mensagemErroQuestao(err)))
      .finally(() => setCarregandoFiltros(false));
  }, []);

  useEffect(() => {
    if (!filtros.materia) { setAssuntos([]); return undefined; }
    let ativo = true;
    setCarregandoAssuntos(true);
    listarAssuntosQuestApi(filtros.materia)
      .then(data => { if (ativo) setAssuntos(data.items); })
      .catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); })
      .finally(() => { if (ativo) setCarregandoAssuntos(false); });
    return () => { ativo = false; };
  }, [filtros.materia]);

  function alterarFiltro(campo, valor) {
    setFiltros(f => ({ ...f, [campo]: valor, ...(campo === 'materia' ? { assunto: '' } : {}) }));
    setPrevia(null);
    setResultado(null);
  }

  async function previsualizar() {
    setBuscando(true);
    setErro('');
    setResultado(null);
    try {
      setPrevia(await previsualizarQuestoesQuestApi(filtros));
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setBuscando(false);
    }
  }

  async function confirmarImportacao() {
    const aviso = `Isto vai consumir créditos da Quest API para importar ${previa?.total ?? 'as'} questões deste filtro. Deseja continuar?`;
    if (!window.confirm(aviso)) return;
    setImportando(true);
    setErro('');
    try {
      setResultado(await sincronizarQuestoesQuestApi(filtros));
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setImportando(false);
    }
  }

  if (carregandoFiltros) return <TelaCarregando texto="Carregando filtros da Quest API…" />;

  return (
    <>
      <div className="page-head">
        <h1>Importar da Quest API</h1>
        <p>Escolha os filtros, pré-visualize e só então confirme a importação — ela consome créditos da Quest API.</p>
      </div>

      {erro && <div className="alert" role="alert">{erro}</div>}

      <div className="campos-linha filtros-importacao">
        <div className="select-field">
          <label htmlFor="materia">Matéria</label>
          <select id="materia" value={filtros.materia} onChange={e => alterarFiltro('materia', e.target.value)}>
            <option value="">Todas</option>
            {materias.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="select-field">
          <label htmlFor="assunto">Assunto</label>
          <select id="assunto" value={filtros.assunto} disabled={!filtros.materia || carregandoAssuntos} onChange={e => alterarFiltro('assunto', e.target.value)}>
            <option value="">{carregandoAssuntos ? 'Carregando…' : 'Todos'}</option>
            {assuntos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="select-field">
          <label htmlFor="banca">Banca</label>
          <select id="banca" value={filtros.banca} onChange={e => alterarFiltro('banca', e.target.value)}>
            <option value="">Todas</option>
            {bancas.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="select-field">
          <label htmlFor="ano">Ano</label>
          <select id="ano" value={filtros.ano} onChange={e => alterarFiltro('ano', e.target.value)}>
            <option value="">Todos</option>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="acoes">
        <button type="button" className="btn btn-secondary btn-inline" onClick={previsualizar} disabled={buscando}>
          {buscando ? 'Buscando…' : 'Pré-visualizar'}
        </button>
      </div>

      {previa && (
        <div className="card-painel previa-importacao">
          <p><strong>{previa.total ?? previa.items.length}</strong> questão(ões) encontrada(s) para este filtro.</p>

          {previa.items.length > 0 && (
            <ul className="lista-questoes previa-lista">
              {previa.items.slice(0, 5).map(item => (
                <li key={item.id} className="card-questao-admin">
                  <HtmlSanitizado html={item.enunciado} as="p" className="card-enunciado" />
                </li>
              ))}
            </ul>
          )}
          {previa.items.length > 5 && <p className="origem-detalhes">Mostrando 5 de {previa.items.length} nesta página.</p>}

          <div className="acoes">
            <button type="button" className="btn btn-primary btn-inline" onClick={confirmarImportacao} disabled={importando || previa.items.length === 0}>
              {importando ? 'Importando…' : 'Confirmar importação'}
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <div className="card-painel resultado-importacao">
          <h3>Importação concluída</h3>
          <ul className="resumo-importacao">
            <li>Recebidas da Quest API: <strong>{resultado.recebidas}</strong></li>
            <li>Importadas: <strong>{resultado.importadas}</strong></li>
            <li>Novas: <strong>{resultado.novas}</strong></li>
            <li>Atualizadas: <strong>{resultado.atualizadas}</strong></li>
            <li>Preservadas (já tinham respostas): <strong>{resultado.preservadas_com_respostas}</strong></li>
          </ul>
        </div>
      )}
    </>
  );
}
