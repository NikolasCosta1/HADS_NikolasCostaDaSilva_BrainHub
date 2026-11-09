// Sem rota de back para sessões de estudo ainda. Guardamos tudo no localStorage
// do navegador, só para já deixar a tela pronta. Nada aqui vai para o servidor.
const CHAVE = 'brainhub.sessoesEstudo.mock';

function ler() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { return []; }
}
function gravar(lista) {
  try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch { /* ignora */ }
}
function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listarSessoes() {
  return [...ler()].sort((a, b) => (b.data || '').localeCompare(a.data || ''));
}

export function salvarSessao(dados, idExistente) {
  const lista = ler();
  if (idExistente) {
    const index = lista.findIndex(s => s.id === idExistente);
    if (index >= 0) lista[index] = { ...lista[index], ...dados };
  } else {
    lista.push({ id: gerarId(), materiais: [], ...dados });
  }
  gravar(lista);
  return listarSessoes();
}

export function removerSessao(id) {
  gravar(ler().filter(s => s.id !== id));
  return listarSessoes();
}
