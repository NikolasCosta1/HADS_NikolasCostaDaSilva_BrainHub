# BrainHub — frontend (tela de login)

Frontend em React + Vite, **separado** do backend (`brainhub-manual`). Nenhum arquivo do backend foi alterado. Por enquanto só existe a tela de login; as áreas do administrador e do aluno são páginas provisórias.

## Iniciar

1. Instale Node.js 22 ou superior.
2. Abra esta pasta no VSCode.
3. Copie `.env.example` para `.env` (a porta do backend em `VITE_PROXY_TARGET` deve ser a do `PORT` dele).
4. Execute:

```bash
npm install
npm run dev
```

Acesse http://localhost:5173. Mantenha o backend rodando (`npm run dev` na outra pasta). Em desenvolvimento, o Vite encaminha `/api` para o backend, então não é preciso configurar CORS.

O endpoint `POST /api/auth/login` ainda não existe no backend; até ele ser implementado, o login mostrará erro de servidor (404 → "Erro inesperado"). Veja o contrato esperado em `docs/login.md`.

Build de produção: `npm run build` (gera `dist/`).

## Pastas (mesma lógica do backend)

| Pasta | Responsabilidade |
| --- | --- |
| src/config | Variáveis de ambiente do front. |
| src/services | Chamadas HTTP (`api.js` é o cliente único; `auth/` para login). |
| src/validators | Validação dos formulários, por módulo. |
| src/contexts | Estado global (sessão do usuário). |
| src/routes | Rotas, proteção por perfil e destino após o login. |
| src/pages | Telas, por módulo (`auth`, `home` provisória). |
| src/components | Componentes reutilizáveis, por módulo. |
| src/utils | Funções auxiliares. |
| src/styles | CSS global. |
| docs | Contrato de login e decisões. |

Fluxo: `LoginPage` → `LoginForm` → `AuthContext.login` → `authService.login` → `POST /api/auth/login`. Após sucesso, ADMINISTRADOR vai para `/admin` e ALUNO para `/aluno`.

## Integração com o backend (área do aluno)

- Login: `POST /api/auth/login`, com validação da sessão em `GET /api/me`. Detalhes em `docs/login.md`.
- Questões (`/aluno/questoes`): lista com filtros de disciplina e assunto (na URL) e paginação de 10 por página. Ao abrir uma questão, o aluno escolhe uma alternativa e recebe o resultado, o gabarito e a explicação. O gabarito só chega depois da resposta.
- Endpoints usados: `GET /api/disciplinas`, `GET /api/assuntos?id_disciplina=`, `GET /api/questoes`, `GET /api/questoes/:id`, `POST /api/questoes/:id/respostas`.
- O Vite encaminha `/api` ao backend em desenvolvimento (`VITE_PROXY_TARGET`). Para publicar o front, será preciso um proxy reverso (ou CORS) no servidor de produção.
