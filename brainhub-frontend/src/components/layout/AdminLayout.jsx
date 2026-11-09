import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../auth/Logo.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ITENS = [
  { to: '/admin/questoes', label: 'Banco de questões' },
  { to: '/admin/importar', label: 'Importar da Quest API' },
  { to: '/admin/catalogo', label: 'Catálogo' },
  { to: '/admin/usuarios', label: 'Usuários' },
  { to: '/admin/relatorio', label: 'Relatório geral' },
];

export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-mini">
          <Logo size={28} />
          <span>BrainHub</span>
        </div>
        <nav aria-label="Administração" className="admin-nav">
          {ITENS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin/questoes'}>{item.label}</NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span>{usuario.nome}</span>
          <ThemeToggle />
          <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>Sair</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
