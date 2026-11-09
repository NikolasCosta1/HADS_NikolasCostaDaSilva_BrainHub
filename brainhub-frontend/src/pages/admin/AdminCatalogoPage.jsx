import { useEffect, useState } from 'react';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import {
  listarDisciplinasAdmin, listarAssuntosAdmin, criarDisciplina, atualizarDisciplina, criarAssunto, atualizarAssunto,
} from '../../services/admin/catalogoAdminService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const DISCIPLINA_VAZIA = { nome: '', descricao: '', ativo: true };
const ASSUNTO_VAZIO = { nome: '', descricao: '', ativo: true };

function FormCatalogo({ titulo, valores, onChange, onSalvar, onCancelar, salvando }) {
  return (
    <div className="card-painel">
      <h3>{titulo}</h3>
      <div className="field">
        <label htmlFor="cat-nome">Nome</label>
        <input id="cat-nome" type="text" maxLength={150} value={valores.nome} onChange={e => onChange({ ...valores, nome: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="cat-descricao">Descrição (opcional)</label>
        <textarea id="cat-descricao" rows={3} maxLength={5000} value={valores.descricao || ''} onChange={e => onChange({ ...valores, descricao: e.target.value })} />
      </div>
      <label className="checkbox-field">
        <input type="checkbox" checked={valores.ativo} onChange={e => onChange({ ...valores, ativo: e.target.checked })} />
        Ativo
      </label>
      <div className="acoes">
        <button type="button" className="btn btn-primary btn-inline" onClick={onSalvar} disabled={salvando || !valores.nome.trim()}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" className="btn btn-secondary btn-inline" onClick={onCancelar} disabled={salvando}>Cancelar</button>
      </div>
    </div>
  );
}

export default function AdminCatalogoPage() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
  const [assuntos, setAssuntos] = useState([]);
  const [carregandoAssuntos, setCarregandoAssuntos] = useState(false);

  const [formDisciplina, setFormDisciplina] = useState(null); // null fechado, {} nova, objeto edição
  const [formAssunto, setFormAssunto] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function carregarDisciplinas() {
    setCarregando(true);
    setErro('');
    listarDisciplinasAdmin().then(setDisciplinas).catch(err => setErro(mensagemErroQuestao(err))).finally(() => setCarregando(false));
  }
  useEffect(carregarDisciplinas, []);

  function carregarAssuntos(disciplina) {
    setDisciplinaSelecionada(disciplina);
    setFormAssunto(null);
    if (!disciplina) { setAssuntos([]); return; }
    setCarregandoAssuntos(true);
    listarAssuntosAdmin(disciplina.id_disciplina).then(setAssuntos).catch(err => setErro(mensagemErroQuestao(err))).finally(() => setCarregandoAssuntos(false));
  }

  async function salvarDisciplina() {
    setSalvando(true);
    setErro('');
    try {
      const corpo = { nome: formDisciplina.nome.trim(), descricao: formDisciplina.descricao?.trim() || null, ativo: formDisciplina.ativo };
      if (formDisciplina.id_disciplina) await atualizarDisciplina(formDisciplina.id_disciplina, corpo);
      else await criarDisciplina(corpo);
      setFormDisciplina(null);
      carregarDisciplinas();
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarAssunto() {
    setSalvando(true);
    setErro('');
    try {
      const corpo = { nome: formAssunto.nome.trim(), descricao: formAssunto.descricao?.trim() || null, ativo: formAssunto.ativo, id_disciplina: disciplinaSelecionada.id_disciplina };
      if (formAssunto.id_assunto) await atualizarAssunto(formAssunto.id_assunto, corpo);
      else await criarAssunto(corpo);
      setFormAssunto(null);
      carregarAssuntos(disciplinaSelecionada);
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <TelaCarregando texto="Carregando catálogo…" />;

  return (
    <>
      <div className="page-head">
        <h1>Catálogo</h1>
        <p>Disciplinas e assuntos usados no banco de questões.</p>
      </div>

      {erro && <div className="alert" role="alert">{erro}</div>}

      <div className="catalogo-colunas">
        <section>
          <div className="page-head-acao">
            <h2>Disciplinas</h2>
            <button type="button" className="btn-link" onClick={() => setFormDisciplina({ ...DISCIPLINA_VAZIA })}>+ Nova disciplina</button>
          </div>

          {formDisciplina && (
            <FormCatalogo
              titulo={formDisciplina.id_disciplina ? 'Editar disciplina' : 'Nova disciplina'}
              valores={formDisciplina}
              onChange={setFormDisciplina}
              onSalvar={salvarDisciplina}
              onCancelar={() => setFormDisciplina(null)}
              salvando={salvando}
            />
          )}

          <ul className="lista-catalogo">
            {disciplinas.map(d => (
              <li key={d.id_disciplina} className={`item-catalogo ${disciplinaSelecionada?.id_disciplina === d.id_disciplina ? 'item-catalogo--selecionado' : ''}`}>
                <button type="button" className="item-catalogo-nome" onClick={() => carregarAssuntos(d)}>
                  {d.nome}
                  {!d.ativo && <span className="status-ponto status-ponto--inativa">Inativa</span>}
                </button>
                <button type="button" className="btn-link" onClick={() => setFormDisciplina({ ...d })}>Editar</button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="page-head-acao">
            <h2>Assuntos {disciplinaSelecionada && `— ${disciplinaSelecionada.nome}`}</h2>
            {disciplinaSelecionada && <button type="button" className="btn-link" onClick={() => setFormAssunto({ ...ASSUNTO_VAZIO })}>+ Novo assunto</button>}
          </div>

          {!disciplinaSelecionada ? (
            <p className="comentarios-vazio">Selecione uma disciplina para ver seus assuntos.</p>
          ) : formAssunto ? (
            <FormCatalogo
              titulo={formAssunto.id_assunto ? 'Editar assunto' : 'Novo assunto'}
              valores={formAssunto}
              onChange={setFormAssunto}
              onSalvar={salvarAssunto}
              onCancelar={() => setFormAssunto(null)}
              salvando={salvando}
            />
          ) : carregandoAssuntos ? (
            <TelaCarregando texto="Carregando assuntos…" />
          ) : assuntos.length === 0 ? (
            <p className="comentarios-vazio">Nenhum assunto cadastrado nesta disciplina.</p>
          ) : (
            <ul className="lista-catalogo">
              {assuntos.map(a => (
                <li key={a.id_assunto} className="item-catalogo">
                  <span className="item-catalogo-nome">
                    {a.nome}
                    {!a.ativo && <span className="status-ponto status-ponto--inativa">Inativo</span>}
                  </span>
                  <button type="button" className="btn-link" onClick={() => setFormAssunto({ ...a })}>Editar</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
