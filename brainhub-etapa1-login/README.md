
Backend em Node.js + Express + PostgreSQL

## Banco de questões: Quest API

O BrainHub mantém uma cópia local das questões importadas no PostgreSQL. Isso preserva as respostas e o histórico de estudo mesmo quando a integração externa está indisponível. Questões importadas ficam identificadas por `fonte='QUEST_API'` e pelo identificador externo; filtros e dados da prova são guardados em `metadados_fonte`.

1. Crie uma chave no painel da Quest API e configure `QUEST_API_KEY` no `.env`. A chave permanece somente no backend.
2. Configure `QUEST_API_BASE_URL=https://api.quest.api.br/v2` (ou deixe o padrão).
3. Em banco existente, aplique a migração aditiva com `npm run db:migrate:quest-api`. Em banco vazio, rode primeiro `npm run db:migrate` e depois essa migração.
4. Com token de administrador, consulte `GET /api/admin/questoes/quest-api?materia=Direito%20Constitucional&per_page=20` para pré-visualizar ou importe com `POST /api/admin/questoes/sincronizar`.

Exemplo de importação:

```http
POST /api/admin/questoes/sincronizar
Authorization: Bearer <token-admin>
Content-Type: application/json

{"materia":"Direito Constitucional","tem_gabarito":true,"per_page":50,"page":1}
```

Os filtros aceitos seguem os parâmetros da Quest API; a importação traz apenas questões com gabarito para manter a correção automática do BrainHub. A página pode ser informada em chamadas seguintes. Reimportações atualizam questões sem respostas, mas preservam o conteúdo de questões que já têm respostas registradas. O endpoint não percorre páginas automaticamente para evitar consumo inesperado de créditos. Configure uma chave válida e uma cota disponível no fornecedor; a API pode responder com erros de autenticação, cota ou limite de chamadas.

As questões preservam o HTML de enunciados e alternativas retornado pela fonte. Ao exibi-lo no frontend, renderize com sanitização por allowlist; não use inserção de HTML confiável sem sanitização.

Para bancos já criados, aplique `npm run db:migrate:comments` uma vez para criar o mural de comentários por questão. O gabarito aceita explicação editável pelo administrador; as explicações locais são preservadas ao sincronizar novamente com a Quest API.

## SEMANA 1

- Login por e-mail/senha; JWT válido por uma hora.
- Hash de senha com scrypt e salt individual.
- Bloqueio de login por 15 minutos após três falhas consecutivas e logs no banco.
- Rota autenticada para consultar o próprio usuário, sem expor hash de senha.
- Script local para criar o primeiro administrador; nenhuma credencial padrão.
- Cadastro público de contas de aluno pela rota `POST /api/auth/register`; o perfil é sempre `ALUNO`.
- Respostas de questões podem ser registradas por ALUNO e ADMINISTRADOR; cada resposta fica vinculada à conta autenticada.
- Relatório autenticado por assunto em `GET /api/relatorios/desempenho-assuntos`, com total de respostas, acertos, erros e aproveitamento do usuário conectado.
- Comentários autenticados por questão em `GET/POST /api/questoes/:id/comentarios`; autores podem editar e remover os próprios comentários.
