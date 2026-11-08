export default function AvisoDemo({ children }) {
  return (
    <div className="aviso-demo" role="note">
      <strong>Dados de demonstração.</strong> {children || 'Esta tela ainda não tem back end; o que aparece aqui fica só neste navegador.'}
    </div>
  );
}
