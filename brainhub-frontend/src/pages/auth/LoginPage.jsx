import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import LoginForm from '../../components/auth/LoginForm.jsx';
import { useAuth, CHAVE_AVISO } from '../../contexts/AuthContext.jsx';
import { homeDoPerfil } from '../../routes/rotasPorPerfil.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  // Aviso deixado pelo app (ex.: sessão expirada). Lido na montagem e apagado logo depois.
  const [aviso] = useState(() => {
    try { return sessionStorage.getItem(CHAVE_AVISO); } catch { return null; }
  });
  useEffect(() => {
    try { sessionStorage.removeItem(CHAVE_AVISO); } catch { /* ignora */ }
  }, []);

  const entrar = async (credenciais) => {
    const usuario = await login(credenciais);
    const home = homeDoPerfil(usuario.perfil);
    navigate(state?.from?.startsWith(home) ? state.from : home, { replace: true });
  };

  return (
    <AuthShell
      titulo="Bem-vindo de volta"
      subtitulo="Entre com seu e-mail e senha para continuar."
      aviso={aviso}
      rodape={<>Ainda não tem conta? <Link to="/cadastro">Cadastre-se como aluno</Link></>}
    >
      <LoginForm onSubmit={entrar} />
    </AuthShell>
  );
}
