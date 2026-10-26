import { useAuth } from '../../contexts/AuthContext.jsx';

// Página provisória só para confirmar o redirecionamento após o login. Será substituída.
export default function PlaceholderPage({ titulo }) {
  const { usuario, logout } = useAuth();
  return (
    <main className="placeholder">
      <h1>{titulo}</h1>
      <p>Olá, {usuario.nome}! Login realizado com sucesso.</p>
      <button type="button" className="btn btn-secondary" onClick={logout}>Sair</button>
    </main>
  );
}
