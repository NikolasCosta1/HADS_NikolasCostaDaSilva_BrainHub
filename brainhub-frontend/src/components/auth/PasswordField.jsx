import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

// Campo de senha no padrão do login: ícone de cadeado e botão para mostrar/ocultar.
export default function PasswordField({ id, error, ...props }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="bh-input-container">
      <span className="bh-input-leading-icon"><Lock size={18} /></span>
      <input
        id={id}
        type={visivel ? 'text' : 'password'}
        className="bh-input-field"
        style={{ paddingRight: '2.8rem' }}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-erro` : undefined}
        {...props}
      />
      <button type="button" className="bh-password-toggle" onClick={() => setVisivel((v) => !v)} aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visivel}>
        {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
