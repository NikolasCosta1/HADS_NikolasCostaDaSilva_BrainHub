import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { listarDisciplinas, listarAssuntos } from '../../services/disciplinas/disciplinasService.js';
import { buscarQuestaoAdmin, criarQuestao, atualizarQuestao } from '../../services/admin/questoesAdminService.js';
import { validarQuestaoAdmin, CODIGOS_POR_TIPO } from '../../validators/admin/questaoAdminValidator.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const VALOR_INICIAL = {
  id_disciplina: '', id_assunto: '', tipo: 'MULTIPLA_ESCOLHA', enunciado: '', ativa: true,
  alternativas: CODIGOS_POR_TIPO.MULTIPLA_ESCOLHA.map(codigo => ({ codigo, texto: '' })),
  gabarito: '', explicacao: '',
};

export default function AdminQuestaoFormPage() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();

  const [disciplinas, setDisciplinas] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [valores, setValores] = useState(VALOR_INICIAL);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [bloqueada, setBloqueada] = useState(false);

  useEffect(() => {
    listarDisciplinas().then(setDisciplinas).catch(err => setErroGeral(mensagemErroQuestao(err)));
  }, []);

  useEffect(() => {
    if (!editando) return;
    let ativo = true;
    buscarQuestaoAdmin(id)
      .then(q => {
        if (!ativo) return;
        setValores({
          id_disciplina: String(q.id_disciplina), id_assunto: String(q.id_assunto), tipo: q.tipo,
          enunciado: q.enunciado, ativa: q.ativa,
          alternativas: CODIGOS_POR_TIPO[q.tipo].map(codigo => {
            const existente = q.alternativas.find(a => a.codigo === codigo);
            return { codigo, texto: existente?.texto || '' };
          }),
          gabarito: q.gabarito || '',
          explicacao: q.explicacao || '',
        });
      })
      .catch(err => { if (ativo) setErroGeral(mensagemErroQuestao(err)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [id, editando]);

  useEffect(() => {
    if (!valores.id_disciplina) { setAssuntos([]); return undefined; }
    let ativo = true;
    listarAssuntos(valores.id_disciplina).then(l => { if (ativo) setAssuntos(l); }).catch(err => { if (ativo) setErroGeral(mensagemErroQuestao(err)); });
    return () => { ativo = false; };
  }, [valores.id_disciplina]);

  // Questões já respondidas não podem ser editadas (o back recusa com 409); nesse caso bloqueamos o formulário.
  useEffect(() => { if (erroGeral.includes('já respondida')) setBloqueada(true); }, [erroGeral]);

  function mudarTipo(tipo) {
    setValores(v => ({
      ...v, tipo, gabarito: '',
      alternativas: CODIGOS_POR_TIPO[tipo].map(codigo => {
        const existente = v.alternativas.find(a => a.codigo === codigo);
        return { codigo, texto: existente?.texto || '' };
      }),
    }));
  }

  function mudarAlternativa(codigo, texto) {
    setValores(v => ({ ...v, alternativas: v.alternativas.map(a => a.codigo === codigo ? { ...a, texto } : a) }));
  }

  async function enviar(e) {
    e.preventDefault();
    const novosErros = validarQuestaoAdmin(valores);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    const corpo = {
      id_assunto: valores.id_assunto, enunciado: valores.enunciado.trim(), tipo: valores.tipo,
      ativa: valores.ativa, alternativas: valores.alternativas, gabarito: valores.gabarito,
      explicacao: valores.explicacao.trim() || undefined,
    };

    setSalvando(true);
    setErroGeral('');
    try {
      if (editando) await atualizarQuestao(id, corpo);
      else await criarQuestao(corpo);
      navigate('/admin/questoes');
    } catch (err) {
      setErroGeral(mensagemErroQuestao(err));
      setSalvando(false);
    }
  }

  if (carregando) return <TelaCarregando texto="Carregando questão…" />;

  return (
    <>
      <div className="page-head">
        <h1>{editando ? 'Editar questão' : 'Nova questão'}</h1>
        <p>{editando ? 'Questões já respondidas não podem ser editadas: inative e cadastre uma nova.' : 'Preencha os dados da questão local.'}</p>
      </div>

      {erroGeral && <div className="alert" role="alert">{erroGeral}</div>}

      <form onSubmit={enviar} className="form questao-admin-form">
        <fieldset disabled={salvando || bloqueada}>
          <div className="campos-linha">
            <div className="select-field">
              <label htmlFor="id_disciplina">Disciplina</label>
              <select id="id_disciplina" value={valores.id_disciplina} onChange={e => setValores(v => ({ ...v, id_disciplina: e.target.value, id_assunto: '' }))}>
                <option value="">Selecione…</option>
                {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nome}</option>)}
              </select>
            </div>
            <div className="select-field">
              <label htmlFor="id_assunto">Assunto</label>
              <select id="id_assunto" value={valores.id_assunto} disabled={!valores.id_disciplina} onChange={e => setValores(v => ({ ...v, id_assunto: e.target.value }))}>
                <option value="">Selecione…</option>
                {assuntos.map(a => <option key={a.id_assunto} value={a.id_assunto}>{a.nome}</option>)}
              </select>
              {erros.id_assunto && <p className="field-error">{erros.id_assunto}</p>}
            </div>
            <div className="select-field">
              <label htmlFor="tipo">Tipo</label>
              <select id="tipo" value={valores.tipo} onChange={e => mudarTipo(e.target.value)}>
                <option value="MULTIPLA_ESCOLHA">Múltipla escolha</option>
                <option value="CERTO_ERRADO">Certo ou errado</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="enunciado">Enunciado</label>
            <textarea id="enunciado" rows={5} value={valores.enunciado} onChange={e => setValores(v => ({ ...v, enunciado: e.target.value }))} />
            {erros.enunciado && <p className="field-error">{erros.enunciado}</p>}
          </div>

          <div className="alternativas-admin">
            <span className="field-label">Alternativas</span>
            {valores.alternativas.map(a => (
              <div key={a.codigo} className="alternativa-admin-linha">
                <span className="alternativa-codigo">{a.codigo})</span>
                <input type="text" maxLength={10000} value={a.texto} onChange={e => mudarAlternativa(a.codigo, e.target.value)} />
              </div>
            ))}
            {erros.alternativas && <p className="field-error">{erros.alternativas}</p>}
          </div>

          <div className="select-field">
            <label htmlFor="gabarito">Gabarito</label>
            <select id="gabarito" value={valores.gabarito} onChange={e => setValores(v => ({ ...v, gabarito: e.target.value }))}>
              <option value="">Selecione…</option>
              {CODIGOS_POR_TIPO[valores.tipo].map(codigo => <option key={codigo} value={codigo}>{codigo}</option>)}
            </select>
            {erros.gabarito && <p className="field-error">{erros.gabarito}</p>}
          </div>

          <div className="field">
            <label htmlFor="explicacao">Explicação (opcional)</label>
            <textarea id="explicacao" rows={4} value={valores.explicacao} onChange={e => setValores(v => ({ ...v, explicacao: e.target.value }))} placeholder="Mostrada ao aluno depois de responder." />
          </div>

          <label className="checkbox-field">
            <input type="checkbox" checked={valores.ativa} onChange={e => setValores(v => ({ ...v, ativa: e.target.checked }))} />
            Questão ativa (visível para os alunos)
          </label>

          <div className="acoes">
            <button type="submit" className="btn btn-primary btn-inline" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar questão'}
            </button>
            <Link to="/admin/questoes" className="btn btn-secondary btn-inline">Cancelar</Link>
          </div>
        </fieldset>
      </form>
    </>
  );
}
