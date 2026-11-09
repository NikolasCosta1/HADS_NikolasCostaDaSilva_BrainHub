// Banca e ano são opcionais: só aparecem quando a tela passa a lista de opções (tela de questões do aluno).
export default function FiltrosQuestoes({
  disciplinas, assuntos, idDisciplina, idAssunto, carregandoAssuntos, onChange,
  bancas, anos, banca = '', ano = '', onLimpar,
}) {
  const temFiltro = idDisciplina || idAssunto || banca || ano;
  return (
    <div className="filtros">
      <div className="select-field">
        <label htmlFor="filtro-disciplina">Disciplina</label>
        <select id="filtro-disciplina" value={idDisciplina} onChange={e => onChange('disciplina', e.target.value)}>
          <option value="">Todas as disciplinas</option>
          {disciplinas.map(d => (
            <option key={d.id_disciplina} value={d.id_disciplina}>{d.nome}</option>
          ))}
        </select>
      </div>
      <div className="select-field">
        <label htmlFor="filtro-assunto">Assunto</label>
        <select
          id="filtro-assunto"
          value={idAssunto}
          disabled={!idDisciplina || carregandoAssuntos}
          onChange={e => onChange('assunto', e.target.value)}
        >
          <option value="">{carregandoAssuntos ? 'Carregando…' : 'Todos os assuntos'}</option>
          {assuntos.map(a => (
            <option key={a.id_assunto} value={a.id_assunto}>{a.nome}</option>
          ))}
        </select>
      </div>
      {bancas && (
        <div className="select-field">
          <label htmlFor="filtro-banca">Banca</label>
          <select id="filtro-banca" value={banca} onChange={e => onChange('banca', e.target.value)}>
            <option value="">Todas as bancas</option>
            {bancas.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}
      {anos && (
        <div className="select-field">
          <label htmlFor="filtro-ano">Ano</label>
          <select id="filtro-ano" value={ano} onChange={e => onChange('ano', e.target.value)}>
            <option value="">Todos os anos</option>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}
      {onLimpar && temFiltro && (
        <button type="button" className="btn-link filtros-limpar" onClick={onLimpar}>Limpar filtros</button>
      )}
    </div>
  );
}
