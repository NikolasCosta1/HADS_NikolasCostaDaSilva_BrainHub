import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import CadastroPage from '../pages/auth/CadastroPage.jsx';
import QuestoesPage from '../pages/aluno/QuestoesPage.jsx';
import QuestaoPage from '../pages/aluno/QuestaoPage.jsx';
import DesempenhoPage from '../pages/aluno/DesempenhoPage.jsx';
import SessoesPage from '../pages/aluno/SessoesPage.jsx';
import AdminQuestoesPage from '../pages/admin/AdminQuestoesPage.jsx';
import AdminQuestaoFormPage from '../pages/admin/AdminQuestaoFormPage.jsx';
import AdminImportarPage from '../pages/admin/AdminImportarPage.jsx';
import AdminCatalogoPage from '../pages/admin/AdminCatalogoPage.jsx';
import AdminUsuariosPage from '../pages/admin/AdminUsuariosPage.jsx';
import AdminRelatorioPage from '../pages/admin/AdminRelatorioPage.jsx';
import AlunoLayout from '../components/layout/AlunoLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import TelaCarregando from '../components/common/TelaCarregando.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { homeDoPerfil } from './rotasPorPerfil.js';

export default function AppRoutes() {
  const { autenticado, usuario, verificando } = useAuth();
  if (verificando) return <TelaCarregando texto="Verificando sua sessão…" />;

  const publica = (Pagina) => (autenticado ? <Navigate to={homeDoPerfil(usuario.perfil)} replace /> : <Pagina />);

  return (
    <Routes>
      <Route path="/login" element={publica(LoginPage)} />
      <Route path="/cadastro" element={publica(CadastroPage)} />
      <Route path="/admin" element={<PrivateRoute perfil="ADMINISTRADOR"><AdminLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="questoes" replace />} />
        <Route path="questoes" element={<AdminQuestoesPage />} />
        <Route path="questoes/nova" element={<AdminQuestaoFormPage />} />
        <Route path="questoes/:id/editar" element={<AdminQuestaoFormPage />} />
        <Route path="importar" element={<AdminImportarPage />} />
        <Route path="catalogo" element={<AdminCatalogoPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
        <Route path="relatorio" element={<AdminRelatorioPage />} />
      </Route>
      <Route path="/aluno" element={<PrivateRoute perfil="ALUNO"><AlunoLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="questoes" replace />} />
        <Route path="questoes" element={<QuestoesPage />} />
        <Route path="questoes/:id" element={<QuestaoPage />} />
        <Route path="desempenho" element={<DesempenhoPage />} />
        <Route path="sessoes" element={<SessoesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
