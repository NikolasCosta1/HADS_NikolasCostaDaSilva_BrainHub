// Os filtros da Quest API vêm como texto ou como objeto. O formato exato não está documentado no back,
// então tenta os nomes de campo mais comuns. Se a API usar outro nome, é só ajustar aqui.
export const valorFacete = (item) => (item && typeof item === 'object'
  ? String(item.valor ?? item.slug ?? item.nome ?? item.name ?? item.id ?? '')
  : String(item ?? ''));
export const rotuloFacete = (item) => (item && typeof item === 'object'
  ? String(item.nome ?? item.name ?? item.label ?? item.valor ?? item.slug ?? item.id ?? '')
  : String(item ?? ''));
