import { useEffect, useState } from 'react';
import HtmlSeguro from '../../components/common/HtmlSeguro.jsx';
import {
  listarAnos, listarAssuntosQuest, listarBancas, listarMaterias, previsualizar, sincronizar,
} from '../../services/admin/questApiService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';
import { rotuloFacete, valorFacete } from '../../utils/facetes.js';
import { textoSimples } from '../../utils/sanitizar.js';

const POR_PAGINA = 10;
const FILTROS_VAZIOS = { materia: '', assunto: '', banca: '', ano: '' };

export default function AdminImportarPage() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [opcoes, setOpcoes] = useState({ materias: [], assuntos: [], bancas: [], anos: [] });
  const [avisoFiltros, setAvisoFiltros] = useState('');
  const [prev, setPrev] = useState(null); // { filtros, page, total, items }
  const [buscando, setBuscando] = useState(false);
  const [confirmou, setConfirmou] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  // Cada filtro é independente: se um falhar (plano da chave, por exemplo), os outros continuam.
  useEffect(() => {
    let ativo = true;
    const falhas = [];
    const carregar = (chave, fn) => fn().then(d => { if (ativo) setOpcoes(o => ({ ...o, [chave]: d.items })); }).catch(err => falhas.push(mensagemErroQuestao(err)));
    Promise.all([carregar('materias', listarMaterias), carregar('bancas', listarBancas), carregar('anos', listarAnos)])
      .then(() => { if (ativo && falhas.length) setAvisoFiltros(`Alguns filtros não carregaram: ${[...new Set(falhas)].join(' ')}`); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!filtros.materia) { setOpcoes(o => ({ ...o, assuntos: [] })); return undefined; }
    let ativo = true;
    listarAssuntosQuest(filtros.materia)
      .then(d => { if (ativo) setOpcoes(o => ({ ...o, assuntos: d.items })); })
      .catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); });
    return () => { ativo = false; };
  }, [filtros.materia]);

  function alterar(campo, valor) {
    setFiltros(f => ({ ...f, [campo]: valor, ...(campo === 'materia' ? { assunto: '' } : {}) }));
    setPrev(null); setResultado(null); setConfirmou(false);
  }

  async function buscar(page = 1, base = filtros) {
    if (!base.materia) { setErro('Escolha ao menos uma matéria para buscar.'); return; }
    setBuscando(true); setErro(''); setResultado(null); setConfirmou(false);
    try {
      const d = await previsualizar(base, page, POR_PAGINA);
      setPrev({ filtros: base, page: d.page ?? page, total: d.total ?? null, items: d.items });
    } catch (err) { setErro(mensagemErroQuestao(err)); }
    finally { setBuscando(false); }
  }

  async function importar() {
    setImportando(true); setErro('');
    try { setResultado(await sincronizar(prev.filtros, prev.page, POR_PAGINA)); setConfirmou(false); }
    catch (err) { setErro(mensagemErroQuestao(err)); }
    finally { setImportando(false); }
  }

  const seletor = (campo, rotulo, itens, desabilitado) => (
    <div className="select-field">
      <label htmlFor={`imp-${campo}`}>{rotulo}</label>
      <select id={`imp-${campo}`} value={filtros[campo]} disabled={desabilitado} onChange={e => alterar(campo, e.target.value)}>
        <option value="">{campo === 'materia' ? 'Selecione…' : 'Todos'}</option>
        {itens.map(i => <option key={valorFacete(i)} value={valorFacete(i)}>{rotuloFacete(i)}</option>)}
      </select>
    </div>
  );

  const totalPaginas = prev?.total ? Math.ceil(prev.total / POR_PAGINA) : null;

  return (
    <>
      <div className="page-head">
        <h1>Importar da Quest API</h1>
        <p>Busque, confira e só então grave as questões no banco local.</p>
      </div>

      <div className="aviso-custo" role="note">
        <strong>Atenção ao custo.</strong> Buscar e importar consomem créditos da Quest API. Nada é importado automaticamente:
        a gravação só acontece quando você confirma. Confira também os termos de uso da API antes de importar em volume.
      </div>

      {avisoFiltros && <div className="alert" role="status">{avisoFiltros}</div>}
      {erro && <div className="alert" role="alert">{erro}</div>}

      <div className="filtros filtros--4">
        {seletor('materia', 'Matéria', opcoes.materias)}
        {seletor('assunto', 'Assunto', opcoes.assuntos, !filtros.materia)}
        {seletor('banca', 'Banca', opcoes.bancas)}
        {seletor('ano', 'Ano', opcoes.anos)}
      </div>
      <button type="button" className="btn btn-primary btn-inline" onClick={() => buscar(1)} disabled={buscando}>
        {buscando ? 'Buscando…' : 'Buscar questões'}
      </button>

      {prev && (
        <section className="painel previa" aria-live="polite">
          <h2>Pré-visualização {prev.total != null && <span className="contagem">({prev.total} na API)</span>}</h2>
          {prev.items.length === 0 ? <p className="vazio">A API não devolveu questões para este filtro.</p> : (
            <ol className="lista-previa" start={(prev.page - 1) * POR_PAGINA + 1}>
              {prev.items.map(q => (
                <li key={q.id}>
                  <p className="previa-meta">{[q.classificacao?.materia, q.classificacao?.assunto, `gabarito: ${q.gabarito || '—'}`].filter(Boolean).join(' · ')}</p>
                  <p className="previa-texto">{textoSimples(q.enunciado).slice(0, 220)}{textoSimples(q.enunciado).length > 220 ? '…' : ''}</p>
                  <details>
                    <summary>Ver alternativas</summary>
                    <ul className="previa-alts">
                      {(q.alternativas || []).map(a => <li key={a.letra}><strong>{a.letra})</strong> <HtmlSeguro as="span" html={a.texto} /></li>)}
                    </ul>
                  </details>
                </li>
              ))}
            </ol>
          )}

          <nav className="paginacao" aria-label="Páginas da pré-visualização">
            <button type="button" className="btn btn-secondary btn-sm" disabled={buscando || prev.page <= 1} onClick={() => buscar(prev.page - 1, prev.filtros)}>Anterior</button>
            <span>Página {prev.page}{totalPaginas ? ` de ${totalPaginas}` : ''}</span>
            <button type="button" className="btn btn-secondary btn-sm" disabled={buscando || (totalPaginas ? prev.page >= totalPaginas : prev.items.length < POR_PAGINA)} onClick={() => buscar(prev.page + 1, prev.filtros)}>Próxima</button>
          </nav>

          {prev.items.length > 0 && (
            <div className="confirmar">
              <label className="check">
                <input type="checkbox" checked={confirmou} onChange={e => setConfirmou(e.target.checked)} />
                Entendo que importar esta página consome créditos da Quest API e grava as questões no banco local.
              </label>
              <button type="button" className="btn btn-primary btn-inline" disabled={!confirmou || importando} onClick={importar}>
                {importando ? 'Importando…' : `Importar página ${prev.page}`}
              </button>
            </div>
          )}
        </section>
      )}

      {resultado && (
        <div className="sucesso" role="status">
          <strong>Importação concluída.</strong> Recebidas: {resultado.recebidas} · Novas: {resultado.novas} · Atualizadas: {resultado.atualizadas} ·
          Preservadas por já terem respostas: {resultado.preservadas_com_respostas}.
          <p className="dica">Questões importadas entram como ativas e sem explicação. Se você havia inativado alguma delas antes, ela volta a ficar ativa; confira na lista do banco.</p>
        </div>
      )}
    </>
  );
}
