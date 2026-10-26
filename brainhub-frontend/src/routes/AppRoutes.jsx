import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import PlaceholderPage from '../pages/home/PlaceholderPage.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { homeDoPerfil } from './rotasPorPerfil.js';

export default function AppRoutes() {
  const { autenticado, usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={autenticado ? <Navigate to={homeDoPerfil(usuario.perfil)} replace /> : <LoginPage />} />
      <Route path="/admin" element={<PrivateRoute perfil="ADMINISTRADOR"><PlaceholderPage titulo="Área do administrador" /></PrivateRoute>} />
      <Route path="/aluno" element={<PrivateRoute perfil="ALUNO"><PlaceholderPage titulo="Área do aluno" /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
