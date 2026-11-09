import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../components/auth/Logo.jsx';
import RegisterForm from '../../components/auth/RegisterForm.jsx';
import { registerAluno } from '../../services/auth/authService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { homeDoPerfil } from '../../routes/rotasPorPerfil.js';
import './LoginPage.css';

export default function RegisterPage() {
  const { entrarComSessao } = useAuth();
  const navigate = useNavigate();

  const cadastrar = async (dados) => {
    const sessao = await registerAluno(dados);
    const usuario = entrarComSessao(sessao);
    navigate(homeDoPerfil(usuario.perfil), { replace: true });
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
          <h1>Criar sua conta</h1>
          <p className="subtitle">Cadastre-se com seus dados para começar a estudar.</p>
          <RegisterForm onSubmit={cadastrar} />
          <p className="help">Já tem acesso? <Link to="/login">Entrar</Link></p>
        </div>
      </main>
    </div>
  );
}
