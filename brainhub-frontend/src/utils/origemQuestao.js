// A Quest API guarda os dados da prova em metadados_fonte.provas[0]. Os nomes exatos dos campos
// não estão documentados no back, então cada um é lido com alternativas e só aparece se existir.
const texto = (v) => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return String(v.nome ?? v.name ?? v.sigla ?? '');
};

export function dadosProva(questao) {
  const prova = Array.isArray(questao?.metadados_fonte?.provas) ? (questao.metadados_fonte.provas[0] || {}) : {};
  return {
    banca: texto(prova.banca),
    ano: texto(prova.ano),
    orgao: texto(prova.orgao),
    cargo: texto(prova.cargo),
  };
}

export const importada = (questao) => questao?.fonte === 'QUEST_API';

// Texto curto para o card da lista: "Quest API · CESPE · 2021".
export function resumoOrigem(questao) {
  if (!importada(questao)) return '';
  const { banca, ano } = dadosProva(questao);
  return ['Quest API', banca, ano].filter(Boolean).join(' · ');
}
