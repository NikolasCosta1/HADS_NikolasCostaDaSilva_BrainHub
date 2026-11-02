import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import PlaceholderPage from '../pages/home/PlaceholderPage.jsx';
import QuestoesPage from '../pages/aluno/QuestoesPage.jsx';
import QuestaoPage from '../pages/aluno/QuestaoPage.jsx';
import AlunoLayout from '../components/layout/AlunoLayout.jsx';
import TelaCarregando from '../components/common/TelaCarregando.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { homeDoPerfil } from './rotasPorPerfil.js';

export default function AppRoutes() {
  const { autenticado, usuario, verificando } = useAuth();
  if (verificando) return <TelaCarregando texto="Verificando sua sessão…" />;

  return (
    <Routes>
      <Route path="/login" element={autenticado ? <Navigate to={homeDoPerfil(usuario.perfil)} replace /> : <LoginPage />} />
      <Route path="/admin" element={<PrivateRoute perfil="ADMINISTRADOR"><PlaceholderPage titulo="Área do administrador" /></PrivateRoute>} />
      <Route path="/aluno" element={<PrivateRoute perfil="ALUNO"><AlunoLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="questoes" replace />} />
        <Route path="questoes" element={<QuestoesPage />} />
        <Route path="questoes/:id" element={<QuestaoPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
