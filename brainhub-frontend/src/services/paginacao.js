// O back limita cada página a 100 itens. Junta todas as páginas (usado nos filtros).
export async function listarTodos(buscarPagina, limit = 100) {
  const itens = [];
  for (let page = 1; page <= 50; page++) {
    const data = await buscarPagina(new URLSearchParams({ page, limit }).toString());
    itens.push(...data.items);
    if (data.items.length < limit) break;
  }
  return itens;
}
