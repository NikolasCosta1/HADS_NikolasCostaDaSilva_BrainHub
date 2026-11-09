import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../auth/Logo.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function AlunoLayout() {
  const { usuario, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mini">
          <Logo size={28} />
          <span>BrainHub</span>
        </div>
        <nav aria-label="Principal">
          <NavLink to="/aluno/questoes">Questões</NavLink>
          <NavLink to="/aluno/desempenho">Desempenho</NavLink>
          <NavLink to="/aluno/sessoes">Sessões de estudo</NavLink>
        </nav>
        <div className="topbar-user">
          <span>{usuario.nome}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>Sair</button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
