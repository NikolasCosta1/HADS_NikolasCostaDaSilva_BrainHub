-- Caderno de revisão: questões que o aluno errou, com uma anotação pessoal. Reexecutável em bancos já migrados.
CREATE TABLE IF NOT EXISTS caderno_questao (
 id_usuario BIGINT NOT NULL REFERENCES usuario ON DELETE RESTRICT,
 id_questao BIGINT NOT NULL REFERENCES questao ON DELETE RESTRICT,
 id_resposta BIGINT NOT NULL REFERENCES resposta ON DELETE RESTRICT,
 anotacao TEXT NOT NULL DEFAULT '' CHECK (length(anotacao) <= 3000),
 criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (id_usuario, id_questao)
);
CREATE INDEX IF NOT EXISTS caderno_questao_usuario ON caderno_questao (id_usuario, criado_em DESC);
