import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import RegisterForm from '../../components/auth/RegisterForm.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { homeDoPerfil } from '../../routes/rotasPorPerfil.js';

export default function CadastroPage() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const cadastrar = async (dados) => {
    const usuario = await registrar(dados);
    navigate(homeDoPerfil(usuario.perfil), { replace: true });
  };

  return (
    <AuthShell
      titulo="Crie sua conta"
      subtitulo="Cadastro de aluno. Leva menos de um minuto."
      rodape={<>Já tem conta? <Link to="/login">Entrar</Link></>}
    >
      <RegisterForm onSubmit={cadastrar} />
    </AuthShell>
  );
}
