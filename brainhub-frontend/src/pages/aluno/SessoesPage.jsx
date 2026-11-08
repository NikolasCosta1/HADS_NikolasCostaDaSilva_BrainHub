import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AvisoDemo from '../../components/common/AvisoDemo.jsx';
import { listarDisciplinas } from '../../services/disciplinas/disciplinasService.js';
import { linkValido, listarSessoes, removerSessao, salvarSessao } from '../../services/sessoes/sessoesService.js';
import { formatarDia, formatarMinutos } from '../../utils/formatar.js';

const hoje = () => new Date().toISOString().slice(0, 10);
const VAZIO = { id: null, disciplina: '', assunto: '', data: hoje(), minutos: '', anotacoes: '', materiais: [] };

export default function SessoesPage() {
  const { usuario } = useAuth();
  const [sessoes, setSessoes] = useState(() => listarSessoes(usuario.id_usuario));
  const [disciplinas, setDisciplinas] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [link, setLink] = useState({ titulo: '', url: '' });
  const [erros, setErros] = useState({});

  useEffect(() => {
    let ativo = true;
    listarDisciplinas().then(l => { if (ativo) setDisciplinas(l); }).catch(() => { /* digita livre se falhar */ });
    return () => { ativo = false; };
  }, []);

  const totalSemana = useMemo(() => {
    const limite = Date.now() - 7 * 86400000;
    return sessoes.filter(s => new Date(s.data).getTime() >= limite).reduce((t, s) => t + Number(s.minutos || 0), 0);
  }, [sessoes]);
  const total = useMemo(() => sessoes.reduce((t, s) => t + Number(s.minutos || 0), 0), [sessoes]);

  const alterar = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (erros[e.target.name]) setErros(x => ({ ...x, [e.target.name]: undefined }));
  };

  function adicionarLink() {
    const url = link.url.trim();
    if (!linkValido(url)) { setErros(x => ({ ...x, link: 'Informe um link começando com http:// ou https://.' })); return; }
    setForm(f => ({ ...f, materiais: [...f.materiais, { titulo: link.titulo.trim() || url, url }] }));
    setLink({ titulo: '', url: '' });
    setErros(x => ({ ...x, link: undefined }));
  }

  function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (!form.disciplina.trim()) novos.disciplina = 'Informe a disciplina estudada.';
    const min = Number(form.minutos);
    if (!Number.isInteger(min) || min < 1 || min > 1440) novos.minutos = 'Informe os minutos (de 1 a 1440).';
    if (!form.data || form.data > hoje()) novos.data = 'Informe uma data que não seja futura.';
    setErros(novos);
    if (Object.keys(novos).length) return;
    salvarSessao(usuario.id_usuario, { ...form, disciplina: form.disciplina.trim(), assunto: form.assunto.trim(), minutos: min, anotacoes: form.anotacoes.trim() });
    setSessoes(listarSessoes(usuario.id_usuario));
    setForm(VAZIO);
  }

  function remover(id) {
    if (!window.confirm('Remover esta sessão de estudo?')) return;
    removerSessao(usuario.id_usuario, id);
    setSessoes(listarSessoes(usuario.id_usuario));
    if (form.id === id) setForm(VAZIO);
  }

  return (
    <>
      <div className="page-head">
        <h1>Sessões de estudo</h1>
        <p>Registre quanto tempo você estudou e guarde links e anotações de cada sessão.</p>
      </div>
      <AvisoDemo>As sessões ficam apenas neste navegador até o back ter essa função.</AvisoDemo>

      <div className="resumo-cards">
        <div className="resumo-card"><span>Últimos 7 dias</span><strong>{formatarMinutos(totalSemana)}</strong></div>
        <div className="resumo-card"><span>Total registrado</span><strong>{formatarMinutos(total)}</strong></div>
        <div className="resumo-card"><span>Sessões</span><strong>{sessoes.length}</strong></div>
      </div>

      <form onSubmit={enviar} noValidate className="painel form-grade">
        <h2>{form.id ? 'Editar sessão' : 'Nova sessão'}</h2>
        <div className="field">
          <label htmlFor="disciplina">Disciplina</label>
          <input id="disciplina" name="disciplina" list="lista-disciplinas" value={form.disciplina} onChange={alterar} maxLength={100}
            aria-invalid={!!erros.disciplina} />
          <datalist id="lista-disciplinas">{disciplinas.map(d => <option key={d.id_disciplina} value={d.nome} />)}</datalist>
          {erros.disciplina && <p className="field-error">{erros.disciplina}</p>}
        </div>
        <div className="field">
          <label htmlFor="assunto">Assunto (opcional)</label>
          <input id="assunto" name="assunto" value={form.assunto} onChange={alterar} maxLength={150} />
        </div>
        <div className="field">
          <label htmlFor="data">Data</label>
          <input id="data" name="data" type="date" max={hoje()} value={form.data} onChange={alterar} aria-invalid={!!erros.data} />
          {erros.data && <p className="field-error">{erros.data}</p>}
        </div>
        <div className="field">
          <label htmlFor="minutos">Tempo (minutos)</label>
          <input id="minutos" name="minutos" type="number" min="1" max="1440" inputMode="numeric" value={form.minutos} onChange={alterar} aria-invalid={!!erros.minutos} />
          {erros.minutos && <p className="field-error">{erros.minutos}</p>}
        </div>
        <div className="field campo-largo">
          <label htmlFor="anotacoes">Anotações</label>
          <textarea id="anotacoes" name="anotacoes" rows={3} maxLength={2000} value={form.anotacoes} onChange={alterar} />
        </div>

        <fieldset className="campo-largo materiais">
          <legend>Materiais (links)</legend>
          <div className="linha-link">
            <input aria-label="Título do material" placeholder="Título (opcional)" value={link.titulo} onChange={e => setLink({ ...link, titulo: e.target.value })} maxLength={100} />
            <input aria-label="Endereço do link" placeholder="https://…" value={link.url} onChange={e => setLink({ ...link, url: e.target.value })} />
            <button type="button" className="btn btn-secondary btn-sm" onClick={adicionarLink}>Adicionar</button>
          </div>
          {erros.link && <p className="field-error">{erros.link}</p>}
          {form.materiais.length > 0 && (
            <ul className="lista-links">
              {form.materiais.map((m, i) => (
                <li key={`${m.url}-${i}`}>
                  <a href={m.url} target="_blank" rel="noopener noreferrer">{m.titulo}</a>
                  <button type="button" className="btn-link btn-link--perigo" onClick={() => setForm(f => ({ ...f, materiais: f.materiais.filter((_, j) => j !== i) }))}>Remover</button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <div className="linha-acoes campo-largo">
          <button type="submit" className="btn btn-primary btn-inline">{form.id ? 'Salvar alterações' : 'Registrar sessão'}</button>
          {form.id && <button type="button" className="btn btn-secondary" onClick={() => setForm(VAZIO)}>Cancelar edição</button>}
        </div>
      </form>

      <h2 className="subtitulo">Histórico</h2>
      {sessoes.length === 0 ? <div className="vazio">Nenhuma sessão registrada ainda.</div> : (
        <ul className="lista-sessoes">
          {sessoes.map(s => (
            <li key={s.id} className="painel">
              <div className="sessao-cab">
                <strong>{s.disciplina}{s.assunto ? ` · ${s.assunto}` : ''}</strong>
                <span>{formatarDia(`${s.data}T12:00:00`)} · {formatarMinutos(s.minutos)}</span>
              </div>
              {s.anotacoes && <p className="sessao-notas">{s.anotacoes}</p>}
              {s.materiais?.length > 0 && (
                <ul className="lista-links">
                  {s.materiais.map((m, i) => <li key={`${m.url}-${i}`}><a href={m.url} target="_blank" rel="noopener noreferrer">{m.titulo}</a></li>)}
                </ul>
              )}
              <div className="linha-acoes">
                <button type="button" className="btn-link" onClick={() => { setForm({ ...VAZIO, ...s, minutos: String(s.minutos) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Editar</button>
                <button type="button" className="btn-link btn-link--perigo" onClick={() => remover(s.id)}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
