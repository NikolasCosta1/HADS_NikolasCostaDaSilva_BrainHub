// Questões importadas da Quest API trazem fonte='QUEST_API' e metadados_fonte.provas[0]
// com dados da prova original (banca, ano, órgão, cargo), nem sempre todos preenchidos.
export default function OrigemQuestao({ fonte, metadadosFonte }) {
  if (fonte !== 'QUEST_API') return null;

  const prova = metadadosFonte?.provas?.[0] || {};
  const detalhes = [prova.banca, prova.ano, prova.orgao, prova.cargo].filter(Boolean);

  return (
    <div className="origem-questao">
      <span className="badge badge-origem">Quest API</span>
      {detalhes.length > 0 && <span className="origem-detalhes">{detalhes.join(' · ')}</span>}
    </div>
  );
}
