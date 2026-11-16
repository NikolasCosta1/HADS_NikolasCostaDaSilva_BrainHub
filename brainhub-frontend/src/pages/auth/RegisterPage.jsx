import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Target, ShieldCheck } from 'lucide-react';
import Marca from '../../components/common/Marca.jsx';
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
    <div className="bh-login-viewport">
      <div className="bh-ambient-canvas" aria-hidden="true">
        <div className="bh-ambient-glow-blue" />
        <div className="bh-ambient-glow-cyan" />
        <div className="bh-ambient-glow-orange" />
        <div className="bh-ambient-grid" />
      </div>

      <aside className="bh-brand-panel">
        <div className="bh-brand-top">
          <Marca size={44} />
        </div>

        <div className="bh-brand-main">
          <div className="bh-brand-hero">
            <h1>
              Estude com foco.
              <br />
              <span className="bh-gradient-text">Evolua com dados.</span>
            </h1>
            <p>Resolva questões, registre suas sessões de estudo e descubra em quais assuntos vale a pena reforçar.</p>
          </div>

          <div className="bh-feature-grid">
            <div className="bh-feature-card">
              <div className="bh-feature-icon"><BookOpen size={17} /></div>
              <h4>Questões comentadas</h4>
              <p>Gabarito e explicação para aprender com cada resposta.</p>
            </div>
            <div className="bh-feature-card">
              <div className="bh-feature-icon orange"><Target size={17} /></div>
              <h4>Desempenho por assunto</h4>
              <p>Veja onde vale a pena reforçar o seu estudo.</p>
            </div>
            <div className="bh-feature-card">
              <div className="bh-feature-icon"><Sparkles size={17} /></div>
              <h4>Anotações de revisão</h4>
              <p>Registre por que errou e revise depois.</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="bh-login-panel">
        <div className="bh-login-card">
          <header className="bh-card-header">
            <div className="bh-card-kicker">
              <Sparkles size={14} />
              <span>Novo por aqui</span>
            </div>
            <h2>Criar sua conta</h2>
            <p>Cadastre-se com seus dados para começar a estudar.</p>
          </header>

          <RegisterForm onSubmit={cadastrar} />

          <div className="bh-card-divider"><span>OU</span></div>

          <div className="bh-card-signup-cta">
            <span>Já tem acesso?</span>
            <Link to="/login" className="bh-signup-link">Entrar na plataforma</Link>
          </div>

          <div className="bh-card-footer-security">
            <ShieldCheck size={15} className="bh-security-icon" />
            <span>Ambiente seguro protegido por criptografia de ponta a ponta</span>
          </div>
        </div>
      </main>
    </div>
  );
}
