import { useEffect, useState } from 'react';

const CHAVE = 'brainhub.tema';

function temaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
  } catch { /* sem armazenamento: segue o sistema */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

// Alterna entre tema claro e escuro e lembra a escolha neste navegador.
export default function ThemeToggle() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.theme = tema === 'escuro' ? 'dark' : 'light';
    try { localStorage.setItem(CHAVE, tema); } catch { /* ignora */ }
  }, [tema]);

  const proximo = tema === 'escuro' ? 'claro' : 'escuro';
  return (
    <button type="button" className="btn-tema" onClick={() => setTema(proximo)} aria-label={`Usar tema ${proximo}`} title={`Usar tema ${proximo}`}>
      {tema === 'escuro' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  );
}
