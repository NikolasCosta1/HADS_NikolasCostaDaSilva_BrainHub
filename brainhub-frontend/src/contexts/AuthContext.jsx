import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest } from '../services/auth/authService.js';
import { setTokenProvider } from '../services/api.js';

const CHAVE = 'brainhub.sessao';
const AuthContext = createContext(null);

// sessionStorage: a sessão termina ao fechar a aba.
function lerSessao() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE)) || null; } catch { return null; }
}
function gravarSessao(s) {
  try { s ? sessionStorage.setItem(CHAVE, JSON.stringify(s)) : sessionStorage.removeItem(CHAVE); } catch { /* ignora */ }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao);

  useEffect(() => { setTokenProvider(() => sessao?.token ?? null); }, [sessao]);

  const login = useCallback(async (credenciais) => {
    const nova = await loginRequest(credenciais);
    gravarSessao(nova);
    setSessao(nova);
    return nova.usuario;
  }, []);

  const logout = useCallback(() => { gravarSessao(null); setSessao(null); }, []);

  const value = useMemo(() => ({ usuario: sessao?.usuario ?? null, autenticado: !!sessao?.token, login, logout }), [sessao, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
