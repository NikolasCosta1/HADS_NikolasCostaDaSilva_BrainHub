export default function FiltrosQuestoes({ disciplinas, assuntos, idDisciplina, idAssunto, carregandoAssuntos, onChange }) {
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
    </div>
  );
}
