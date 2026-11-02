export default function TelaCarregando({ texto = 'Carregando…' }) {
  return (
    <div className="tela-carregando" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}
