import { useEffect, useState } from 'react';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { listarDisciplinasAdmin } from '../../services/admin/catalogoAdminService.js';
import { buscarRelatorioGeral } from '../../services/relatorios/relatoriosService.js';
import { baixarCsv } from '../../utils/exportarCsv.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

function CardResumo({ titulo, valor }) {
  return (
    <div className="card-resumo">
      <span className="card-resumo-valor">{valor}</span>
      <span className="card-resumo-titulo">{titulo}</span>
    </div>
  );
}

export default function AdminRelatorioGeralPage() {
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', idDisciplina: '' });
  const [disciplinas, setDisciplinas] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarDisciplinasAdmin().then(setDisciplinas).catch(() => {});
  }, []);

  useEffect(() => {
    if (filtros.dataInicio && filtros.dataFim && filtros.dataInicio > filtros.dataFim) {
      setErro('A data inicial não pode ser maior que a data final.');
      return undefined;
    }
    let ativo = true;
    setCarregando(true);
    setErro('');
    buscarRelatorioGeral(filtros)
      .then(data => { if (ativo) setRelatorio(data); })
      .catch(err => { if (ativo) { setRelatorio(null); setErro(mensagemErroQuestao(err)); } })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [filtros]);

  const alterar = (campo) => (e) => setFiltros(f => ({ ...f, [campo]: e.target.value }));

  function exportar() {
    if (!relatorio) return;
    const linhas = relatorio.assuntos.map(a => [a.disciplina, a.assunto, a.tentativas, a.acertos, a.alunos, String(a.aproveitamento).replace('.', ',')]);
    baixarCsv('relatorio-geral-brainhub.csv', ['Disciplina', 'Assunto', 'Tentativas', 'Acertos', 'Alunos', 'Aproveitamento (%)'], linhas);
  }

  const resumo = relatorio?.resumo;

  return (
    <>
      <div className="page-head page-head-acao">
        <div>
          <h1>Relatório geral</h1>
          <p>Visão consolidada das respostas dos alunos, por período e disciplina.</p>
        </div>
        <button type="button" className="btn btn-secondary btn-inline" onClick={exportar} disabled={!relatorio || relatorio.assuntos.length === 0}>
          Exportar CSV
        </button>
      </div>

      <div className="campos-linha filtros-relatorio">
        <div className="select-field">
          <label htmlFor="data-inicio">De</label>
          <input id="data-inicio" type="date" className="input-data" value={filtros.dataInicio} onChange={alterar('dataInicio')} />
        </div>
        <div className="select-field">
          <label htmlFor="data-fim">Até</label>
          <input id="data-fim" type="date" className="input-data" value={filtros.dataFim} onChange={alterar('dataFim')} />
        </div>
        <div className="select-field">
          <label htmlFor="rel-disciplina">Disciplina</label>
          <select id="rel-disciplina" value={filtros.idDisciplina} onChange={alterar('idDisciplina')}>
            <option value="">Todas as disciplinas</option>
            {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nome}</option>)}
          </select>
        </div>
      </div>

      {erro && <div className="alert" role="alert">{erro}</div>}

      {carregando ? (
        <TelaCarregando texto="Carregando relatório…" />
      ) : relatorio && (
        <>
          <div className="resumo-grid">
            <CardResumo titulo="Alunos ativos" valor={resumo.alunos_ativos} />
            <CardResumo titulo="Questões ativas" valor={resumo.questoes_ativas} />
            <CardResumo titulo="Respostas no período" valor={resumo.total_respostas} />
            <CardResumo titulo="Alunos que responderam" valor={resumo.alunos_com_respostas} />
            <CardResumo titulo="Aproveitamento geral" valor={`${resumo.aproveitamento_geral}%`} />
          </div>

          <h2 className="secao-titulo">Aproveitamento por assunto</h2>
          {relatorio.assuntos.length === 0 ? (
            <div className="vazio">Nenhuma resposta de aluno neste filtro.</div>
          ) : (
            <div className="tabela-wrap">
              <table className="tabela-desempenho">
                <thead>
                  <tr><th>Disciplina</th><th>Assunto</th><th>Tentativas</th><th>Acertos</th><th>Alunos</th><th>Aproveitamento</th></tr>
                </thead>
                <tbody>
                  {relatorio.assuntos.map(a => (
                    <tr key={a.id_assunto}>
                      <td>{a.disciplina}</td>
                      <td>{a.assunto}</td>
                      <td>{a.tentativas}</td>
                      <td>{a.acertos}</td>
                      <td>{a.alunos}</td>
                      <td>
                        <span className={`aproveitamento ${a.aproveitamento < 50 ? 'aproveitamento--baixo' : a.aproveitamento >= 80 ? 'aproveitamento--alto' : ''}`}>
                          {a.aproveitamento}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
