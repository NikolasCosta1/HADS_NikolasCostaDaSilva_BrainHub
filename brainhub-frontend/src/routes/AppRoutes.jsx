import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import QuestoesPage from '../pages/aluno/QuestoesPage.jsx';
import QuestaoPage from '../pages/aluno/QuestaoPage.jsx';
import DesempenhoPage from '../pages/aluno/DesempenhoPage.jsx';
import SessoesEstudoPage from '../pages/aluno/SessoesEstudoPage.jsx';
import AlunoLayout from '../components/layout/AlunoLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import AdminQuestoesPage from '../pages/admin/AdminQuestoesPage.jsx';
import AdminQuestaoFormPage from '../pages/admin/AdminQuestaoFormPage.jsx';
import AdminImportarPage from '../pages/admin/AdminImportarPage.jsx';
import AdminCatalogoPage from '../pages/admin/AdminCatalogoPage.jsx';
import AdminUsuariosPage from '../pages/admin/AdminUsuariosPage.jsx';
import AdminRelatorioGeralPage from '../pages/admin/AdminRelatorioGeralPage.jsx';
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
      <Route path="/cadastro" element={autenticado ? <Navigate to={homeDoPerfil(usuario.perfil)} replace /> : <RegisterPage />} />

      <Route path="/admin" element={<PrivateRoute perfil="ADMINISTRADOR"><AdminLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="questoes" replace />} />
        <Route path="questoes" element={<AdminQuestoesPage />} />
        <Route path="questoes/novo" element={<AdminQuestaoFormPage />} />
        <Route path="questoes/:id" element={<AdminQuestaoFormPage />} />
        <Route path="importar" element={<AdminImportarPage />} />
        <Route path="catalogo" element={<AdminCatalogoPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
        <Route path="relatorio" element={<AdminRelatorioGeralPage />} />
      </Route>

      <Route path="/aluno" element={<PrivateRoute perfil="ALUNO"><AlunoLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="questoes" replace />} />
        <Route path="questoes" element={<QuestoesPage />} />
        <Route path="questoes/:id" element={<QuestaoPage />} />
        <Route path="desempenho" element={<DesempenhoPage />} />
        <Route path="sessoes" element={<SessoesEstudoPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
