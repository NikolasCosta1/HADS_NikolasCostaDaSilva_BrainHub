import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, me as meRequest } from '../services/auth/authService.js';
import { setTokenProvider, setUnauthorizedHandler } from '../services/api.js';

const CHAVE = 'brainhub.sessao';
export const CHAVE_AVISO = 'brainhub.aviso';
const MSG_SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente.';
const AuthContext = createContext(null);

// sessionStorage: a sessão termina ao fechar a aba (o token do back dura 1 hora).
function lerSessao() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE)) || null; } catch { return null; }
}
function gravarSessao(s) {
  try { s ? sessionStorage.setItem(CHAVE, JSON.stringify(s)) : sessionStorage.removeItem(CHAVE); } catch { /* ignora */ }
}
function gravarAviso(texto) {
  try { sessionStorage.setItem(CHAVE_AVISO, texto); } catch { /* ignora */ }
}

export function AuthProvider({ children }) {
  const [inicial] = useState(lerSessao);
  const [sessao, setSessao] = useState(inicial);
  const [verificando, setVerificando] = useState(!!inicial?.token);

  const encerrar = useCallback((aviso) => {
    gravarSessao(null);
    if (aviso) gravarAviso(aviso);
    setSessao(null);
  }, []);

  // Definidos na renderização (não em useEffect): efeitos dos filhos rodam antes dos do pai,
  // então as primeiras requisições precisam já ter o token e o tratador de 401.
  setTokenProvider(() => sessao?.token ?? null);
  setUnauthorizedHandler(() => encerrar(MSG_SESSAO_EXPIRADA));

  // Ao abrir ou recarregar a página, confere o token no back (GET /api/me).
  useEffect(() => {
    if (!inicial?.token) return undefined;
    let ativo = true;
    meRequest()
      .then(dados => {
        if (!ativo) return;
        const atual = { ...inicial, usuario: { ...inicial.usuario, ...dados } };
        gravarSessao(atual);
        setSessao(atual);
      })
      .catch(err => {
        // Só derruba a sessão se o token foi recusado; falha de rede mantém o login local.
        if (ativo && err.status === 401) encerrar(MSG_SESSAO_EXPIRADA);
      })
      .finally(() => { if (ativo) setVerificando(false); });
    return () => { ativo = false; };
  }, [inicial, encerrar]);

  const login = useCallback(async (credenciais) => {
    const nova = await loginRequest(credenciais);
    gravarSessao(nova);
    setSessao(nova);
    return nova.usuario;
  }, []);

  const logout = useCallback(() => encerrar(), [encerrar]);

  const value = useMemo(() => ({
    usuario: sessao?.usuario ?? null,
    autenticado: !!sessao?.token,
    verificando,
    login,
    logout,
  }), [sessao, verificando, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
