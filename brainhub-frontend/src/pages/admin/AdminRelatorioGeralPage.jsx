// Não existe endpoint de relatório geral no back ainda. Os números abaixo são
// fictícios, só para a tela ficar pronta quando o back existir.
const RESUMO_DEMO = [
  { titulo: 'Alunos ativos', valor: 128 },
  { titulo: 'Questões no banco', valor: 342 },
  { titulo: 'Respostas no período', valor: 2150 },
  { titulo: 'Aproveitamento médio', valor: '67%' },
];

const ASSUNTOS_DEMO = [
  { assunto: 'Controle de constitucionalidade', disciplina: 'Direito Constitucional', tentativas: 210, aproveitamento: 48 },
  { assunto: 'Atos administrativos', disciplina: 'Direito Administrativo', tentativas: 185, aproveitamento: 52 },
  { assunto: 'Crase', disciplina: 'Língua Portuguesa', tentativas: 160, aproveitamento: 74 },
  { assunto: 'Orçamento público', disciplina: 'Direito Financeiro', tentativas: 97, aproveitamento: 39 },
  { assunto: 'Regência verbal', disciplina: 'Língua Portuguesa', tentativas: 140, aproveitamento: 81 },
];

export default function AdminRelatorioGeralPage() {
  return (
    <>
      <div className="page-head">
        <h1>Relatório geral</h1>
        <p>Visão consolidada de alunos e questões.</p>
      </div>

      <div className="alert alert-info" role="status">
        Esta tela ainda não está conectada ao servidor: os números abaixo são dados de demonstração.
      </div>

      <div className="resumo-grid">
        {RESUMO_DEMO.map(item => (
          <div key={item.titulo} className="card-resumo">
            <span className="card-resumo-valor">{item.valor}</span>
            <span className="card-resumo-titulo">{item.titulo}</span>
          </div>
        ))}
      </div>

      <h2 className="secao-titulo">Assuntos com menor aproveitamento</h2>
      <div className="tabela-wrap">
        <table className="tabela-desempenho">
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Assunto</th>
              <th>Tentativas</th>
              <th>Aproveitamento</th>
            </tr>
          </thead>
          <tbody>
            {ASSUNTOS_DEMO.sort((a, b) => a.aproveitamento - b.aproveitamento).map(item => (
              <tr key={item.assunto}>
                <td>{item.disciplina}</td>
                <td>{item.assunto}</td>
                <td>{item.tentativas}</td>
                <td>
                  <span className={`aproveitamento ${item.aproveitamento < 50 ? 'aproveitamento--baixo' : item.aproveitamento >= 80 ? 'aproveitamento--alto' : ''}`}>
                    {item.aproveitamento}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
