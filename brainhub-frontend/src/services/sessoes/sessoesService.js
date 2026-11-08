// SEM BACK END: as sessões de estudo ficam só neste navegador (localStorage), separadas por usuário.
// Quando o back tiver /sessoes, basta trocar o corpo destas funções por chamadas a request().
const chave = (idUsuario) => `brainhub.demo.sessoes.${idUsuario}`;

function ler(idUsuario) {
  try { const v = JSON.parse(localStorage.getItem(chave(idUsuario))); return Array.isArray(v) ? v : []; } catch { return []; }
}
function gravar(idUsuario, lista) {
  try { localStorage.setItem(chave(idUsuario), JSON.stringify(lista)); } catch { /* armazenamento cheio ou bloqueado */ }
}

export const listarSessoes = (idUsuario) => ler(idUsuario).sort((a, b) => b.data.localeCompare(a.data));

export function salvarSessao(idUsuario, sessao) {
  const lista = ler(idUsuario);
  const nova = { ...sessao, id: sessao.id || `s${Date.now()}${Math.floor(Math.random() * 1000)}` };
  const i = lista.findIndex(s => s.id === nova.id);
  if (i >= 0) lista[i] = nova; else lista.push(nova);
  gravar(idUsuario, lista);
  return nova;
}

export const removerSessao = (idUsuario, id) => gravar(idUsuario, ler(idUsuario).filter(s => s.id !== id));

// Só aceita links http(s); qualquer outra coisa (javascript:, data:) é descartada.
export function linkValido(texto) {
  try { const u = new URL(texto); return ['http:', 'https:'].includes(u.protocol); } catch { return false; }
}
