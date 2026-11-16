import { NavLink, Outlet } from 'react-router-dom';
import { Library, Download, Layers, Users, BarChart3, LogOut } from 'lucide-react';
import Marca from '../common/Marca.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { iniciais } from '../common/iniciais.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ITENS = [
  { to: '/admin/questoes', label: 'Banco de questões', icone: Library },
  { to: '/admin/importar', label: 'Importar da Quest API', icone: Download },
  { to: '/admin/catalogo', label: 'Catálogo', icone: Layers },
  { to: '/admin/usuarios', label: 'Usuários', icone: Users },
  { to: '/admin/relatorio', label: 'Relatório geral', icone: BarChart3 },
];

export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Marca size={32} />
        <nav aria-label="Administração" className="admin-nav">
          {ITENS.map(({ to, label, icone: Icone }) => (
            <NavLink key={to} to={to} end={to === '/admin/questoes'}><Icone size={18} />{label}</NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="avatar" aria-hidden="true">{iniciais(usuario.nome)}</span>
          <span className="usuario-nome">{usuario.nome}</span>
          <ThemeToggle />
          <button type="button" className="btn-tema" onClick={logout} aria-label="Sair" title="Sair"><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
