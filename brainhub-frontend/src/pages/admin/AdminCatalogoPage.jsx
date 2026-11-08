import { useCallback, useEffect, useState } from 'react';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { listarAssuntosAdmin, listarDisciplinasAdmin, salvarAssunto, salvarDisciplina } from '../../services/admin/catalogoAdminService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const VAZIO = { id: null, nome: '', descricao: '', ativo: true };

export default function AdminCatalogoPage() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [idDisciplina, setIdDisciplina] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formD, setFormD] = useState(VAZIO);
  const [formA, setFormA] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);

  const carregarDisciplinas = useCallback(async () => {
    try { setDisciplinas(await listarDisciplinasAdmin()); }
    catch (err) { setErro(mensagemErroQuestao(err)); }
    finally { setCarregando(false); }
  }, []);
  useEffect(() => { carregarDisciplinas(); }, [carregarDisciplinas]);

  useEffect(() => {
    if (!idDisciplina) { setAssuntos([]); return undefined; }
    let ativo = true;
    listarAssuntosAdmin(idDisciplina).then(l => { if (ativo) setAssuntos(l); }).catch(err => { if (ativo) setErro(mensagemErroQuestao(err)); });
    return () => { ativo = false; };
  }, [idDisciplina]);

  async function guardar(e, tipo) {
    e.preventDefault();
    const form = tipo === 'D' ? formD : formA;
    if (!form.nome.trim()) { setErro('Informe o nome.'); return; }
    if (tipo === 'A' && !idDisciplina) { setErro('Escolha uma disciplina para cadastrar assuntos.'); return; }
    setSalvando(true);
    setErro('');
    try {
      if (tipo === 'D') {
        await salvarDisciplina({ ...form, nome: form.nome.trim(), descricao: form.descricao.trim() });
        setFormD(VAZIO); await carregarDisciplinas();
      } else {
        await salvarAssunto({ ...form, idDisciplina, nome: form.nome.trim(), descricao: form.descricao.trim() });
        setFormA(VAZIO); setAssuntos(await listarAssuntosAdmin(idDisciplina));
      }
    } catch (err) { setErro(mensagemErroQuestao(err)); }
    finally { setSalvando(false); }
  }

  const formulario = (tipo, form, setForm) => (
    <form onSubmit={e => guardar(e, tipo)} noValidate className="form-inline">
      <input aria-label="Nome" placeholder={tipo === 'D' ? 'Nome da disciplina' : 'Nome do assunto'} value={form.nome} maxLength={tipo === 'D' ? 100 : 150} onChange={e => setForm({ ...form, nome: e.target.value })} />
      <input aria-label="Descrição" placeholder="Descrição (opcional)" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
      <label className="check"><input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
      <button type="submit" className="btn btn-primary btn-sm btn-inline" disabled={salvando}>{form.id ? 'Salvar' : 'Adicionar'}</button>
      {form.id && <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm(VAZIO)}>Cancelar</button>}
    </form>
  );

  if (carregando) return <TelaCarregando texto="Carregando catálogo…" />;

  return (
    <>
      <div className="page-head">
        <h1>Disciplinas e assuntos</h1>
        <p>Inativar esconde o item dos alunos. Assuntos não podem ser movidos de disciplina.</p>
      </div>
      {erro && <div className="alert" role="alert">{erro}</div>}

      <section className="painel">
        <h2>Disciplinas</h2>
        {formulario('D', formD, setFormD)}
        <ul className="lista-simples">
          {disciplinas.map(d => (
            <li key={d.id_disciplina} className={idDisciplina === String(d.id_disciplina) ? 'selecionada' : ''}>
              <button type="button" className="btn-link" onClick={() => setIdDisciplina(String(d.id_disciplina))}>{d.nome}</button>
              <span className={d.ativo ? 'status status--ok' : 'status status--off'}>{d.ativo ? 'Ativa' : 'Inativa'}</span>
              <button type="button" className="btn-link" onClick={() => setFormD({ id: d.id_disciplina, nome: d.nome, descricao: d.descricao || '', ativo: d.ativo })}>Editar</button>
            </li>
          ))}
          {disciplinas.length === 0 && <li className="vazio">Nenhuma disciplina cadastrada.</li>}
        </ul>
      </section>

      <section className="painel">
        <h2>Assuntos {idDisciplina ? `de ${disciplinas.find(d => String(d.id_disciplina) === idDisciplina)?.nome ?? ''}` : ''}</h2>
        {!idDisciplina ? <p className="dica">Clique em uma disciplina acima para ver e cadastrar seus assuntos.</p> : (
          <>
            {formulario('A', formA, setFormA)}
            <ul className="lista-simples">
              {assuntos.map(a => (
                <li key={a.id_assunto}>
                  <span>{a.nome}</span>
                  <span className={a.ativo ? 'status status--ok' : 'status status--off'}>{a.ativo ? 'Ativo' : 'Inativo'}</span>
                  <button type="button" className="btn-link" onClick={() => setFormA({ id: a.id_assunto, nome: a.nome, descricao: a.descricao || '', ativo: a.ativo })}>Editar</button>
                </li>
              ))}
              {assuntos.length === 0 && <li className="vazio">Nenhum assunto nesta disciplina.</li>}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
