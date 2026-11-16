import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const CHAVE = 'brainhub.tema';

// O padrão é o tema escuro (igual ao login). Quem escolher o claro fica com ele neste navegador.
function temaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
  } catch { /* sem armazenamento: usa o padrão */ }
  return 'escuro';
}

export default function ThemeToggle() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.theme = tema === 'escuro' ? 'dark' : 'light';
    try { localStorage.setItem(CHAVE, tema); } catch { /* ignora */ }
  }, [tema]);

  const proximo = tema === 'escuro' ? 'claro' : 'escuro';
  return (
    <button type="button" className="btn-tema" onClick={() => setTema(proximo)} aria-label={`Usar tema ${proximo}`} title={`Usar tema ${proximo}`}>
      {tema === 'escuro' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
