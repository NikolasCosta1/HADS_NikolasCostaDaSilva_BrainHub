import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Target,
  ShieldCheck,
  TrendingUp,
  Zap,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { useAuth, CHAVE_AVISO } from '../../contexts/AuthContext.jsx';
import { homeDoPerfil } from '../../routes/rotasPorPerfil.js';
import { mensagemErroLogin } from '../../utils/mensagensLogin.js';
import './LoginPage.css';

/**
 * Logotipo Vetorial SVG Exclusivo da BrainHub
 * Representa os hemisférios neurais com conexões sinápticas (Azul Elétrico + Nós Laranja)
 */
export function BrainHubLogo({ size = 42 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bhLogoGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0066FF" />
            <stop offset="0.5" stopColor="#2563EB" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="bhGlowOrange" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="1" stopColor="#FB923C" />
          </linearGradient>
          <filter id="bhDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2563EB" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Base Squircle Glass */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="13"
          fill="#0D162C"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="1.5"
          filter="url(#bhDropShadow)"
        />

        {/* Linhas de Sinapse / Circuitos Neurais */}
        <g stroke="url(#bhLogoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Conexões Centrais */}
          <path d="M24 13V24M24 24L15 17M24 24L33 17M24 24L16 32M24 24L32 32M24 24V35" opacity="0.85" />
          {/* Arcos do Cérebro */}
          <path d="M15 15C12 17 11 20 11 24C11 28 13 31 16 33" strokeDasharray="1 2" opacity="0.6" />
          <path d="M33 15C36 17 37 20 37 24C37 28 35 31 32 33" strokeDasharray="1 2" opacity="0.6" />
        </g>

        {/* Núcleo Central de Inteligência */}
        <circle cx="24" cy="24" r="4.5" fill="#38BDF8" />
        <circle cx="24" cy="24" r="2" fill="#FFFFFF" />

        {/* Nódulos Periféricos (Destaques em Laranja BrainHub) */}
        <circle cx="15" cy="17" r="2.8" fill="url(#bhGlowOrange)" />
        <circle cx="33" cy="17" r="2.8" fill="url(#bhGlowOrange)" />
        <circle cx="24" cy="13" r="2.4" fill="#60A5FA" />
        <circle cx="16" cy="32" r="2.6" fill="#38BDF8" />
        <circle cx="32" cy="32" r="2.6" fill="url(#bhGlowOrange)" />
        <circle cx="24" cy="35" r="2.4" fill="#60A5FA" />
      </svg>
    </div>
  );
}

/**
 * Validador semântico de credenciais do formulário
 */
function validarCredenciais({ email, senha }) {
  const erros = {};
  const emailLimpo = email ? email.trim() : '';
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailLimpo) {
    erros.email = 'Por favor, insira o seu e-mail cadastrado.';
  } else if (!regexEmail.test(emailLimpo) || emailLimpo.length > 254) {
    erros.email = 'Endereço de e-mail inválido. Verifique o formato.';
  }

  if (!senha) {
    erros.senha = 'Por favor, insira a sua senha de acesso.';
  } else if (senha.length < 4) {
    erros.senha = 'A senha informada deve ter ao menos 4 caracteres.';
  }

  return erros;
}

/**
 * Componente Principal LoginPage
 */
export default function LoginPage() {
  const authContext = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Estados dos Campos
  const [valores, setValores] = useState({ email: '', senha: '' });
  const [lembrarMe, setLembrarMe] = useState(true);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Leitura de aviso de expiração de sessão
  const [aviso] = useState(() => {
    try {
      return sessionStorage.getItem(CHAVE_AVISO);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.removeItem(CHAVE_AVISO);
    } catch {
      /* ignora erro de armazenamento */
    }
  }, []);

  // Manipulação de mudança nos campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));

    if (erros[name]) {
      setErros((prev) => ({ ...prev, [name]: undefined }));
    }
    if (erroGeral) {
      setErroGeral('');
    }
  };

  // Submissão do Formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    const novosErros = validarCredenciais(valores);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      const primeiroId = novosErros.email ? 'email-input' : 'senha-input';
      document.getElementById(primeiroId)?.focus();
      return;
    }

    setEnviando(true);
    setErroGeral('');

    try {
      if (authContext && typeof authContext.login === 'function') {
        const usuario = await authContext.login({
          email: valores.email.trim(),
          senha: valores.senha,
        });
        const rotaPadrao = homeDoPerfil ? homeDoPerfil(usuario?.perfil) : '/aluno/questoes';
        const destino = state?.from?.startsWith(rotaPadrao) ? state.from : rotaPadrao;
        navigate(destino, { replace: true });
      } else {
        // Fallback simulado caso seja utilizado em ambiente desacoplado
        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate('/aluno/questoes', { replace: true });
      }
    } catch (err) {
      if (typeof mensagemErroLogin === 'function') {
        setErroGeral(mensagemErroLogin(err));
      } else {
        setErroGeral(
          err?.status === 401
            ? 'E-mail ou senha incorretos, ou usuário temporariamente bloqueado.'
            : 'Não foi possível realizar o login. Verifique sua conexão e tente novamente.'
        );
      }
      setValores((prev) => ({ ...prev, senha: '' }));
      setEnviando(false);
    }
  };

  return (
    <div className="bh-login-viewport">
      {/* Luzes de Fundo Ambientais & Grid Futurista */}
      <div className="bh-ambient-canvas" aria-hidden="true">
        <div className="bh-ambient-glow-blue" />
        <div className="bh-ambient-glow-cyan" />
        <div className="bh-ambient-glow-orange" />
        <div className="bh-ambient-grid" />
      </div>

      {/* =====================================================================
          COLUNA ESQUERDA: Showcase da Marca & Estatísticas BrainHub (PC)
          ===================================================================== */}
      <aside className="bh-brand-panel">
        {/* Topo: Logo + Tag de Status */}
        <div className="bh-brand-top">
          <Link to="/" className="bh-logo-link" title="BrainHub - Página Inicial">
            <BrainHubLogo size={44} />
            <span className="bh-brand-title">
              Brain<span className="hub">Hub</span>
              <span className="dot">.</span>
            </span>
          </Link>

          <div className="bh-version-badge">
            <span className="bh-pulse-dot" />
            <span>v2.4 Inteligência Ativa</span>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="bh-brand-main">
          <div className="bh-brand-hero">
            <h1>
              Estude com foco.
              <br />
              <span className="bh-gradient-text">Evolua com dados.</span>
            </h1>
            <p>
              Acelere sua aprovação com milhares de questões comentadas, diagnósticos preditivos
              de desempenho e cronogramas que se adaptam às suas reais dificuldades.
            </p>
          </div>

          {/* Card Interativo de Métricas com Glassmorphism */}
          <div className="bh-metric-glass-card">
            <div className="bh-metric-header">
              <div className="bh-metric-title-group">
                <div className="bh-metric-icon-box">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3>Acurácia do Ciclo Atual</h3>
                </div>
              </div>
              <div className="bh-metric-badge">
                <TrendingUp size={14} />
                <span>+34.8% no mês</span>
              </div>
            </div>

            <div className="bh-progress-track">
              <div className="bh-progress-item">
                <div className="bh-progress-labels">
                  <span>Direito Constitucional & Adm.</span>
                  <span className="pct">92%</span>
                </div>
                <div className="bh-bar-bg">
                  <div className="bh-bar-fill-blue" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="bh-progress-item">
                <div className="bh-progress-labels">
                  <span>Raciocínio Lógico & Matemática</span>
                  <span className="pct">78%</span>
                </div>
                <div className="bh-bar-bg">
                  <div className="bh-bar-fill-orange" style={{ width: '78%' }} />
                </div>
              </div>

              <div className="bh-progress-item">
                <div className="bh-progress-labels">
                  <span>Língua Portuguesa & Interpretação</span>
                  <span className="pct">86%</span>
                </div>
                <div className="bh-bar-bg">
                  <div className="bh-bar-fill-blue" style={{ width: '86%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Grid de 3 Funcionalidades Principais */}
          <div className="bh-feature-grid">
            <div className="bh-feature-card">
              <div className="bh-feature-icon">
                <Target size={17} />
              </div>
              <h4>Treino Direcionado</h4>
              <p>Filtros refinados por bancas examinadoras, cargos e anos.</p>
            </div>

            <div className="bh-feature-card">
              <div className="bh-feature-icon orange">
                <Zap size={17} />
              </div>
              <h4>Revisão Espaçada</h4>
              <p>O sistema reapresenta pontos críticos antes do esquecimento.</p>
            </div>

            <div className="bh-feature-card">
              <div className="bh-feature-icon">
                <Sparkles size={17} />
              </div>
              <h4>Gabarito Analítico</h4>
              <p>Explicações minuciosas com fundamentação teórica de peso.</p>
            </div>
          </div>
        </div>

        {/* Rodapé Social Proof / Confiança */}
        <div className="bh-social-proof">
          <div className="bh-avatar-stack">
            <div className="bh-avatar-pill bh-av-1">MT</div>
            <div className="bh-avatar-pill bh-av-2">LC</div>
            <div className="bh-avatar-pill bh-av-3">RS</div>
            <div className="bh-avatar-pill bh-av-4">+15k</div>
          </div>
          <div>
            <div className="bh-social-text">
              <strong>Mais de 15.000 estudantes</strong> praticando hoje.
            </div>
            <div className="bh-stars-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
              <span style={{ marginLeft: 6, color: '#94a3b8', fontSize: '0.75rem' }}>
                4.9 / 5.0 em aprovações
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          COLUNA DIREITA: Painel de Autenticação com Glassmorphism (PC)
          ===================================================================== */}
      <main className="bh-login-panel">
        <div className="bh-login-card">
          {/* Cabeçalho do Card */}
          <header className="bh-card-header">
            <div className="bh-card-kicker">
              <Sparkles size={14} />
              <span>Portal de Acesso</span>
            </div>
            <h2>Bem-vindo de volta</h2>
            <p>Entre com seu e-mail e senha para retomar seu plano de estudos.</p>
          </header>

          {/* Alerta de Notificação / Sessão Expirada */}
          {aviso && (
            <div className="bh-alert-box bh-alert-notice" role="status">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{aviso}</div>
            </div>
          )}

          {/* Alerta de Erro Geral */}
          {erroGeral && (
            <div className="bh-alert-box bh-alert-danger" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{erroGeral}</div>
            </div>
          )}

          {/* Formulário de Autenticação */}
          <form onSubmit={handleSubmit} noValidate className="bh-auth-form">
            {/* Campo E-mail */}
            <div className="bh-input-group">
              <label htmlFor="email-input">E-mail institucional ou pessoal</label>
              <div className="bh-input-container">
                <span className="bh-input-leading-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="exemplo@brainhub.com.br"
                  value={valores.email}
                  onChange={handleInputChange}
                  maxLength={254}
                  autoFocus
                  aria-invalid={!!erros.email}
                  aria-describedby={erros.email ? 'email-erro-msg' : undefined}
                  className="bh-input-field"
                />
              </div>
              {erros.email && (
                <p className="bh-field-error-text" id="email-erro-msg">
                  <AlertCircle size={14} />
                  <span>{erros.email}</span>
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="bh-input-group">
              <div className="bh-input-label-row">
                <label htmlFor="senha-input">Senha de acesso</label>
              </div>
              <div className="bh-input-container">
                <span className="bh-input-leading-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="senha-input"
                  name="senha"
                  type={senhaVisivel ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={valores.senha}
                  onChange={handleInputChange}
                  aria-invalid={!!erros.senha}
                  aria-describedby={erros.senha ? 'senha-erro-msg' : undefined}
                  className="bh-input-field"
                  style={{ paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  className="bh-password-toggle"
                  onClick={() => setSenhaVisivel((v) => !v)}
                  aria-label={senhaVisivel ? 'Ocultar senha' : 'Exibir senha em texto'}
                  title={senhaVisivel ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {senhaVisivel ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {erros.senha && (
                <p className="bh-field-error-text" id="senha-erro-msg">
                  <AlertCircle size={14} />
                  <span>{erros.senha}</span>
                </p>
              )}
            </div>

            {/* Opções: Lembrar de mim e Esqueceu a Senha */}
            <div className="bh-form-options">
              <label className="bh-remember-me">
                <input
                  type="checkbox"
                  checked={lembrarMe}
                  onChange={(e) => setLembrarMe(e.target.checked)}
                  className="bh-custom-checkbox"
                />
                <span>Lembrar neste computador</span>
              </label>

              <a
                href="#recuperar-senha"
                onClick={(e) => {
                  e.preventDefault();
                  alert('A funcionalidade de recuperação de senha será enviada para o seu e-mail cadastrado.');
                }}
                className="bh-forgot-password-link"
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Botão de Submissão com Transição & Efeito Glow */}
            <button
              type="submit"
              className="bh-btn-submit"
              disabled={enviando}
              aria-busy={enviando}
            >
              {enviando ? (
                <>
                  <span className="bh-spinner-ring" aria-hidden="true" />
                  <span>Autenticando sessão…</span>
                </>
              ) : (
                <>
                  <span>Entrar na Plataforma</span>
                  <ArrowRight size={18} className="bh-btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="bh-card-divider">
            <span>OU</span>
          </div>

          {/* Link para Criar Conta */}
          <div className="bh-card-signup-cta">
            <span>Ainda não possui uma conta?</span>
            <Link to="/cadastro" className="bh-signup-link">
              Cadastre-se gratuitamente
            </Link>
          </div>

          {/* Rodapé de Segurança */}
          <div className="bh-card-footer-security">
            <ShieldCheck size={15} className="bh-security-icon" />
            <span>Ambiente seguro protegido por criptografia de ponta a ponta</span>
          </div>
        </div>
      </main>
    </div>
  );
}
