import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { listarDisciplinasAdmin, listarAssuntosAdmin } from '../../services/admin/catalogoAdminService.js';
import { atualizarQuestao, buscarQuestaoAdmin, criarQuestao } from '../../services/admin/adminQuestoesService.js';
import { CODIGOS, validarQuestaoForm } from '../../validators/admin/questaoFormValidator.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';
import { importada } from '../../utils/origemQuestao.js';

const NOVO = { tipo: 'MULTIPLA_ESCOLHA', idDisciplina: '', idAssunto: '', enunciado: '', alternativas: {}, gabarito: '', explicacao: '', ativa: true };

export default function AdminQuestaoFormPage() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();
  const voltarPara = useLocation().state?.voltarPara || '/admin/questoes';

  const [v, setV] = useState(NOVO);
  const [fonte, setFonte] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await listarDisciplinasAdmin();
        if (!ativo) return;
        setDisciplinas(lista);
        if (editando) {
          const q = await buscarQuestaoAdmin(id);
          if (!ativo) return;
          setAssuntos(await listarAssuntosAdmin(q.id_disciplina));
          setFonte(q);
          setV({
            tipo: q.tipo, idDisciplina: String(q.id_disciplina), idAssunto: String(q.id_assunto), enunciado: q.enunciado,
            alternativas: Object.fromEntries(q.alternativas.map(a => [a.codigo, a.texto])), gabarito: q.gabarito || '',
            explicacao: q.explicacao || '', ativa: q.ativa,
          });
        }
      } catch (err) { if (ativo) setErroGeral(mensagemErroQuestao(err)); }
      finally { if (ativo) setCarregando(false); }
    })();
    return () => { ativo = false; };
  }, [id, editando]);

  async function escolherDisciplina(idDisciplina) {
    setV(x => ({ ...x, idDisciplina, idAssunto: '' }));
    setAssuntos([]);
    if (idDisciplina) {
      try { setAssuntos(await listarAssuntosAdmin(idDisciplina)); } catch (err) { setErroGeral(mensagemErroQuestao(err)); }
    }
  }

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    const novos = validarQuestaoForm(v);
    setErros(novos);
    if (Object.keys(novos).length) return;
    const dados = {
      id_assunto: v.idAssunto, enunciado: v.enunciado.trim(), tipo: v.tipo, ativa: v.ativa, gabarito: v.gabarito,
      alternativas: CODIGOS[v.tipo].map(codigo => ({ codigo, texto: v.alternativas[codigo].trim() })),
    };
    // O back atual ignora este campo; passa a valer quando o patch da explicação for aplicado.
    if (v.explicacao.trim()) dados.explicacao = v.explicacao.trim();
    setEnviando(true);
    setErroGeral('');
    try {
      if (editando) await atualizarQuestao(id, dados); else await criarQuestao(dados);
      navigate(voltarPara, { replace: true });
    } catch (err) {
      setErroGeral(mensagemErroQuestao(err));
      setEnviando(false);
    }
  }

  if (carregando) return <TelaCarregando texto="Carregando…" />;

  const codigos = CODIGOS[v.tipo];
  return (
    <>
      <div className="page-head">
        <h1>{editando ? `Editar questão #${id}` : 'Nova questão'}</h1>
        {fonte && importada(fonte) && <p>Questão importada da Quest API. Alterar o texto aqui muda só a cópia local.</p>}
      </div>
      {erroGeral && <div className="alert" role="alert">{erroGeral}</div>}

      <form onSubmit={enviar} noValidate className="painel form-grade">
        <div className="field">
          <label htmlFor="q-tipo">Tipo</label>
          <select id="q-tipo" value={v.tipo} disabled={editando} onChange={e => setV(x => ({ ...x, tipo: e.target.value, alternativas: {}, gabarito: '' }))}>
            <option value="MULTIPLA_ESCOLHA">Múltipla escolha (A a E)</option>
            <option value="CERTO_ERRADO">Certo ou errado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="q-ativa">Situação</label>
          <select id="q-ativa" value={String(v.ativa)} onChange={e => setV(x => ({ ...x, ativa: e.target.value === 'true' }))}>
            <option value="true">Ativa (visível aos alunos)</option>
            <option value="false">Inativa</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="q-disciplina">Disciplina</label>
          <select id="q-disciplina" value={v.idDisciplina} onChange={e => escolherDisciplina(e.target.value)}>
            <option value="">Selecione…</option>
            {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nome}{d.ativo ? '' : ' (inativa)'}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="q-assunto">Assunto</label>
          <select id="q-assunto" value={v.idAssunto} disabled={!v.idDisciplina} onChange={e => setV(x => ({ ...x, idAssunto: e.target.value }))} aria-invalid={!!erros.idAssunto}>
            <option value="">Selecione…</option>
            {assuntos.map(a => <option key={a.id_assunto} value={a.id_assunto}>{a.nome}{a.ativo ? '' : ' (inativo)'}</option>)}
          </select>
          {erros.idAssunto && <p className="field-error">{erros.idAssunto}</p>}
        </div>

        <div className="field campo-largo">
          <label htmlFor="q-enunciado">Enunciado</label>
          <textarea id="q-enunciado" rows={5} value={v.enunciado} onChange={e => setV(x => ({ ...x, enunciado: e.target.value }))} aria-invalid={!!erros.enunciado} />
          {erros.enunciado && <p className="field-error">{erros.enunciado}</p>}
        </div>

        <fieldset className="campo-largo alternativas-form">
          <legend>Alternativas (marque a correta)</legend>
          {codigos.map(c => (
            <div key={c} className="alt-linha">
              <label className="alt-gab">
                <input type="radio" name="gabarito" checked={v.gabarito === c} onChange={() => setV(x => ({ ...x, gabarito: c }))} />
                <strong>{c})</strong>
              </label>
              <input aria-label={`Texto da alternativa ${c}`} value={v.alternativas[c] || ''} onChange={e => setV(x => ({ ...x, alternativas: { ...x.alternativas, [c]: e.target.value } }))} />
            </div>
          ))}
          {erros.alternativas && <p className="field-error">{erros.alternativas}</p>}
          {erros.gabarito && <p className="field-error">{erros.gabarito}</p>}
        </fieldset>

        <div className="field campo-largo">
          <label htmlFor="q-explicacao">Explicação (opcional)</label>
          <textarea id="q-explicacao" rows={4} value={v.explicacao} onChange={e => setV(x => ({ ...x, explicacao: e.target.value }))} />
          <small className="dica">Aparece para o aluno depois que ele responde.</small>
        </div>

        <div className="linha-acoes campo-largo">
          <button type="submit" className="btn btn-primary btn-inline" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar questão'}</button>
          <Link to={voltarPara} className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
