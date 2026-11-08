import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../auth/Logo.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

const MENU = [
  ['/admin/questoes', 'Banco de questões'],
  ['/admin/importar', 'Importar (Quest API)'],
  ['/admin/catalogo', 'Disciplinas e assuntos'],
  ['/admin/usuarios', 'Usuários'],
  ['/admin/relatorio', 'Relatório geral'],
];

export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-mini"><Logo size={28} /><span>BrainHub</span></div>
        <nav aria-label="Administração">
          {MENU.map(([to, rotulo]) => <NavLink key={to} to={to}>{rotulo}</NavLink>)}
        </nav>
        <div className="sidebar-user">
          <span>{usuario.nome}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>Sair</button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}
