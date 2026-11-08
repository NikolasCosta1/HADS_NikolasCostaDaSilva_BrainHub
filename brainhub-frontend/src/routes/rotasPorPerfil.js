export const HOME_POR_PERFIL = { ADMINISTRADOR: '/admin', ALUNO: '/aluno' };
export const homeDoPerfil = (perfil) => HOME_POR_PERFIL[perfil] || '/login';
