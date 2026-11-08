// O back não informa o total de registros, então só dá para ir para a página anterior ou seguinte.
export default function Paginacao({ page, temProxima, desabilitada, onChange }) {
  return (
    <nav className="paginacao" aria-label="Paginação">
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange(page - 1)} disabled={page <= 1 || desabilitada}>
        Anterior
      </button>
      <span>Página {page}</span>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange(page + 1)} disabled={!temProxima || desabilitada}>
        Próxima
      </button>
    </nav>
  );
}
