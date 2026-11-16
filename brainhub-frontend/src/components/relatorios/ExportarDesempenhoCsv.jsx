import { useState } from 'react';
import { request } from '../../services/api.js';
import { baixarCsv } from '../../utils/exportarCsv.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

const POR_PAGINA = 100; // máximo aceito pelo back

async function buscarTodos({ idDisciplina, idAssunto }) {
  const itens = [];
  for (let page = 1; page <= 50; page += 1) {
    const params = new URLSearchParams({ page: String(page), limit: String(POR_PAGINA) });
    if (idDisciplina) params.set('id_disciplinas', idDisciplina);
    if (idAssunto) params.set('id_assunto', idAssunto);
    const data = await request(`/relatorios/desempenho-assuntos?${params}`);
    itens.push(...data.items);
    if (data.items.length < POR_PAGINA) break;
  }
  return itens;
}

function dataBr(valor) {
  if (!valor) return '';
  try { return new Date(valor).toLocaleDateString('pt-BR'); } catch { return ''; }
}

// Baixa o desempenho do próprio aluno (respeitando os filtros da tela) em CSV compatível com Excel.
export default function ExportarDesempenhoCsv({ idDisciplina, idAssunto }) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState('');

  async function exportar() {
    setBaixando(true);
    setErro('');
    try {
      const itens = await buscarTodos({ idDisciplina, idAssunto });
      if (itens.length === 0) { setErro('Não há desempenho para exportar neste filtro.'); return; }
      baixarCsv(
        'meu-desempenho-brainhub.csv',
        ['Disciplina', 'Assunto', 'Tentativas', 'Acertos', 'Erros', 'Aproveitamento (%)', 'Última resposta'],
        itens.map(i => [i.disciplina, i.assunto, i.tentativas, i.acertos, i.erros, String(i.aproveitamento).replace('.', ','), dataBr(i.ultima_resposta)])
      );
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="exportar-csv">
      <button type="button" className="btn btn-secondary btn-inline" onClick={exportar} disabled={baixando}>
        {baixando ? 'Gerando…' : 'Exportar CSV'}
      </button>
      {erro && <p className="field-error" role="alert">{erro}</p>}
    </div>
  );
}
