# Contrato da tela de login

O front **não altera o back end**. Ele consome o endpoint já planejado em `docs/regras-e-rotas.md` do back end:

`POST /api/auth/login` — público, com proteção por tentativas.

## Requisição

```json
{ "email": "aluno@exemplo.com", "senha": "********" }
```

## Resposta de sucesso esperada (200)

```json
{
  "token": "<jwt ou token de sessão>",
  "usuario": { "id": 1, "nome": "Maria", "perfil": "ALUNO" }
}
```

`perfil` deve ser `ALUNO` ou `ADMINISTRADOR` (valores da tabela `usuario`). O token é enviado depois em `Authorization: Bearer <token>`.

> O endpoint ainda não existe. Quando for implementado, se o formato da resposta for diferente, ajuste **apenas** `src/services/auth/authService.js`.

## Erros tratados (campo `message` do JSON é usado quando existir)

| Status | Mensagem exibida |
| --- | --- |
| 400 | Mensagem do servidor ou "Dados inválidos…" |
| 401 | E-mail ou senha incorretos. |
| 403 | Acesso desativado (`ativo = false`). |
| 423 | Conta bloqueada após três falhas (`bloqueado_ate`). |
| 429 | Muitas tentativas. |
| 5xx / sem rede | Servidor indisponível / sem conexão. |

A mensagem de 401 é propositalmente genérica, para não revelar se o e-mail existe.

## Decisões de segurança

- Não há link de "cadastre-se": administradores e alunos são criados pelo administrador.
- A sessão fica em `sessionStorage` (termina ao fechar a aba). Se o back end passar a usar cookie `HttpOnly`, remova o armazenamento do token em `AuthContext.jsx`.
- A senha é limpa do campo após uma tentativa falha.
- As validações do front são só de conveniência; as oficiais são as do back end.
