import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, NotebookPen, BarChart3, Timer, LogOut } from 'lucide-react';
import Marca from '../common/Marca.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { iniciais } from '../common/iniciais.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function AlunoLayout() {
  const { usuario, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <Marca size={32} />
        <nav aria-label="Principal">
          <NavLink to="/aluno/questoes"><BookOpen size={17} />Questões</NavLink>
          <NavLink to="/aluno/anotacoes"><NotebookPen size={17} />Anotações</NavLink>
          <NavLink to="/aluno/desempenho"><BarChart3 size={17} />Desempenho</NavLink>
          <NavLink to="/aluno/sessoes"><Timer size={17} />Sessões de estudo</NavLink>
        </nav>
        <div className="topbar-user">
          <ThemeToggle />
          <span className="avatar" aria-hidden="true">{iniciais(usuario.nome)}</span>
          <span className="usuario-nome">{usuario.nome}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={logout}><LogOut size={16} />Sair</button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
