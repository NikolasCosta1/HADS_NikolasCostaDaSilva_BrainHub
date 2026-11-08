import { useMemo } from 'react';
import AvisoDemo from '../../components/common/AvisoDemo.jsx';
import { obterRelatorioGeral } from '../../services/relatorios/relatorioGeralService.js';
import { formatarMinutos, formatarPercentual } from '../../utils/formatar.js';

export default function AdminRelatorioPage() {
  const r = useMemo(obterRelatorioGeral, []);
  const maxResp = Math.max(...r.semanas.map(s => s.respostas));
  const ordenados = [...r.assuntos].sort((a, b) => a.aproveitamento - b.aproveitamento);

  return (
    <>
      <div className="page-head">
        <h1>Relatório geral</h1>
        <p>Visão de todos os alunos: uso, desempenho e assuntos mais difíceis.</p>
      </div>
      <AvisoDemo>Estes números são fictícios. O back ainda não tem relatório geral nem registro de tempo de estudo.</AvisoDemo>

      <div className="resumo-cards">
        <div className="resumo-card"><span>Alunos ativos</span><strong>{r.alunos_ativos}</strong></div>
        <div className="resumo-card"><span>Questões respondidas</span><strong>{r.total_respondidas}</strong></div>
        <div className="resumo-card"><span>Aproveitamento geral</span><strong>{formatarPercentual(r.aproveitamento_geral)}</strong></div>
        <div className="resumo-card"><span>Tempo estudado</span><strong>{formatarMinutos(r.minutos_estudados)}</strong></div>
      </div>

      <section className="painel">
        <h2>Respostas por semana</h2>
        <ul className="grafico-barras" aria-label="Respostas por semana">
          {r.semanas.map(s => (
            <li key={s.rotulo}>
              <div className="coluna" style={{ height: `${Math.round(s.respostas / maxResp * 100)}%` }} title={`${s.respostas} respostas`} />
              <span>{s.rotulo}</span><small>{s.respostas}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="painel">
        <h2>Assuntos com pior aproveitamento</h2>
        <div className="tabela-wrap">
          <table className="tabela">
            <thead><tr><th>Assunto</th><th>Tentativas</th><th>Aproveitamento</th></tr></thead>
            <tbody>
              {ordenados.map(a => (
                <tr key={`${a.disciplina}-${a.assunto}`}>
                  <td><strong>{a.assunto}</strong><br /><small>{a.disciplina}</small></td>
                  <td>{a.tentativas}</td>
                  <td>
                    <div className="barra" role="img" aria-label={`Aproveitamento de ${formatarPercentual(a.aproveitamento)}`}>
                      <div className={`barra-preenchida ${a.aproveitamento < 50 ? 'barra--ruim' : a.aproveitamento < 70 ? 'barra--media' : 'barra--boa'}`} style={{ width: `${a.aproveitamento}%` }} />
                    </div>
                    {formatarPercentual(a.aproveitamento)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
