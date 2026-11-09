// Gera e baixa um CSV compatível com Excel em português (separador ';' e BOM UTF-8).
// Células que começam com = + - @ ganham um apóstrofo para não virarem fórmula no Excel.
function celula(valor) {
  let texto = valor === null || valor === undefined ? '' : String(valor);
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`;
  return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function baixarCsv(nomeArquivo, cabecalho, linhas) {
  const conteudo = [cabecalho, ...linhas].map(l => l.map(celula).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF', conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
