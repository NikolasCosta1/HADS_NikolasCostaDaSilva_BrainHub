import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/auth/Logo.jsx';
import LoginForm from '../../components/auth/LoginForm.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { homeDoPerfil } from '../../routes/rotasPorPerfil.js';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const entrar = async (credenciais) => {
    const usuario = await login(credenciais);
    const home = homeDoPerfil(usuario.perfil);
    navigate(state?.from?.startsWith(home) ? state.from : home, { replace: true });
  };

  return (
    <div className="login">
      <aside className="login-brand">
        <div className="brand-top"><Logo size={44} /><span>BrainHub</span></div>
        <div className="brand-copy">
          <h2>Estude com foco.<br />Evolua com dados.</h2>
          <p>Resolva questões, registre suas sessões de estudo e descubra em quais assuntos vale a pena reforçar.</p>
        </div>
        <ul className="brand-points">
          <li>Questões comentadas com gabarito</li>
          <li>Histórico de desempenho por assunto</li>
          <li>Materiais organizados por sessão</li>
        </ul>
      </aside>

      <main className="login-panel">
        <div className="login-card">
          <div className="mobile-logo"><Logo size={36} /><span>BrainHub</span></div>
          <h1>Bem-vindo de volta</h1>
          <p className="subtitle">Entre com seu e-mail e senha para continuar.</p>
          <LoginForm onSubmit={entrar} />
          <p className="help">Não tem acesso? Solicite o cadastro ao administrador.</p>
        </div>
      </main>
    </div>
  );
}
