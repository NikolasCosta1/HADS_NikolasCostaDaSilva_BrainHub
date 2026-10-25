
Backend em Node.js + Express + PostgreSQL

## SEMANA 1

- Login por e-mail/senha; JWT válido por uma hora.
- Hash de senha com scrypt e salt individual.
- Bloqueio de login por 15 minutos após três falhas consecutivas e logs no banco.
- Rota autenticada para consultar o próprio usuário, sem expor hash de senha.
- Script local para criar o primeiro administrador; nenhuma credencial padrão.
