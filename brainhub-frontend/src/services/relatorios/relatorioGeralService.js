// SEM BACK END: relatório geral do administrador com números inventados, só para a tela existir.
// Os dados são gerados uma vez e ficam no localStorage para não mudarem a cada abertura.
const CHAVE = 'brainhub.demo.relatorioGeral';

function gerar() {
  const assuntos = [
    ['Direito Constitucional', 'Direitos fundamentais', 412, 71.4], ['Direito Constitucional', 'Organização do Estado', 268, 63.1],
    ['Português', 'Interpretação de texto', 530, 78.9], ['Português', 'Crase', 190, 52.6],
    ['Matemática', 'Porcentagem', 344, 58.7], ['Matemática', 'Raciocínio lógico', 297, 47.8],
    ['Informática', 'Segurança da informação', 221, 66.5], ['Direito Administrativo', 'Licitações', 305, 55.3],
  ].map(([disciplina, assunto, tentativas, aproveitamento]) => ({ disciplina, assunto, tentativas, aproveitamento }));
  const semanas = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'].map((rotulo, i) => ({
    rotulo, respostas: 180 + i * 45 + (i % 2) * 30, minutos: 3200 + i * 520,
  }));
  const total = assuntos.reduce((s, a) => s + a.tentativas, 0);
  const acertos = assuntos.reduce((s, a) => s + Math.round(a.tentativas * a.aproveitamento / 100), 0);
  return {
    alunos_ativos: 38, total_respondidas: total, aproveitamento_geral: Math.round(acertos * 1000 / total) / 10,
    minutos_estudados: semanas.reduce((s, x) => s + x.minutos, 0), assuntos, semanas,
  };
}

export function obterRelatorioGeral() {
  try { const v = JSON.parse(localStorage.getItem(CHAVE)); if (v?.assuntos) return v; } catch { /* gera de novo */ }
  const dados = gerar();
  try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch { /* ignora */ }
  return dados;
}
