import Logo from '../auth/Logo.jsx';

// Logo + nome, igual ao da tela de login ("Hub" em azul degradê e ponto laranja).
export default function Marca({ size = 32 }) {
  return (
    <span className="marca">
      <Logo size={size} />
      <span className="marca-nome">Brain<span className="hub">Hub</span><span className="dot">.</span></span>
    </span>
  );
}
