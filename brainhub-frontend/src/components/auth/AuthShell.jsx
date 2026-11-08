import Logo from './Logo.jsx';
import '../../pages/auth/LoginPage.css';

// Moldura comum de login e cadastro: painel de marca à esquerda e cartão do formulário à direita.
export default function AuthShell({ titulo, subtitulo, aviso, children, rodape }) {
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
          <h1>{titulo}</h1>
          <p className="subtitle">{subtitulo}</p>
          {aviso && <div className="alert" role="status">{aviso}</div>}
          {children}
          {rodape && <p className="help">{rodape}</p>}
        </div>
      </main>
    </div>
  );
}
