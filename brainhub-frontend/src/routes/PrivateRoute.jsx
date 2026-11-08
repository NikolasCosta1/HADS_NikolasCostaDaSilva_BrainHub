import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { homeDoPerfil } from './rotasPorPerfil.js';

// A autorização real é feita no back end; aqui apenas se organiza a navegação.
export default function PrivateRoute({ perfil, children }) {
  const { autenticado, usuario } = useAuth();
  const location = useLocation();
  if (!autenticado) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (perfil && usuario.perfil !== perfil) return <Navigate to={homeDoPerfil(usuario.perfil)} replace />;
  return children;
}
