import { useState } from 'react';

export default function PasswordField({ id, error, ...props }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="input-wrap">
      <input id={id} type={visivel ? 'text' : 'password'} aria-invalid={!!error} aria-describedby={error ? `${id}-erro` : undefined} {...props} />
      <button type="button" className="toggle" onClick={() => setVisivel((v) => !v)} aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visivel}>
        {visivel ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
