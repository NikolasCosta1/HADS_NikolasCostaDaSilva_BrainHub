# Autenticação no front

Consome o back em `POST /api/auth/login` (público) e `GET /api/me` (protegido).

## Login

Requisição: `{ "email": "...", "senha": "..." }`

Resposta 200: `{ "token", "token_type", "expires_in": 3600, "usuario": { "id_usuario", "nome", "email", "perfil" } }`

- `perfil` ALUNO → vai para `/aluno`; ADMINISTRADOR → vai para `/admin`.
- O token é guardado em `sessionStorage` (sai ao fechar a aba) e enviado em `Authorization: Bearer`.

## Erros

| Status | Mensagem exibida |
| --- | --- |
| 400 | Mensagem do servidor (ex.: formato de e-mail) |
| 401 | "E-mail ou senha inválidos, ou conta temporariamente bloqueada." |
| 429 | Muitas tentativas |
| 5xx / sem rede | Servidor indisponível / sem conexão |

O back responde 401 tanto para senha errada quanto para conta bloqueada ou inativa. Isso é intencional, para não revelar se o e-mail existe.

## Sessão

- Ao abrir ou recarregar o app, `GET /api/me` confere o token. Se ele for recusado (401), a sessão é encerrada e o usuário vai para o login com o aviso "Sua sessão expirou".
- Qualquer 401 em uma requisição protegida encerra a sessão da mesma forma.
- Falha de rede ao verificar a sessão não derruba o login local.
