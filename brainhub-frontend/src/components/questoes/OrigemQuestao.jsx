import { dadosProva, importada } from '../../utils/origemQuestao.js';

// Mostra de onde a questão veio. Questões locais não mostram nada.
export default function OrigemQuestao({ questao }) {
  if (!importada(questao)) return null;
  const { banca, ano, orgao, cargo } = dadosProva(questao);
  const itens = [['Banca', banca], ['Ano', ano], ['Órgão', orgao], ['Cargo', cargo]].filter(([, v]) => v);
  return (
    <aside className="origem" aria-label="Origem da questão">
      <span className="badge">Quest API</span>
      {itens.map(([rotulo, valor]) => <span key={rotulo}><strong>{rotulo}:</strong> {valor}</span>)}
    </aside>
  );
}
