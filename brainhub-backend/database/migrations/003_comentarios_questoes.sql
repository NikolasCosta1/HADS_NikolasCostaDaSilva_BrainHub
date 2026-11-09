-- Espaço de discussão por questão. Reexecutável em bancos já migrados.
CREATE TABLE IF NOT EXISTS comentario_questao (
 id_comentario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_questao BIGINT NOT NULL REFERENCES questao ON DELETE RESTRICT,
 id_usuario BIGINT NOT NULL REFERENCES usuario ON DELETE RESTRICT,
 texto TEXT NOT NULL CHECK (length(trim(texto)) BETWEEN 1 AND 3000),
 criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS comentario_questao_data ON comentario_questao (id_questao, criado_em);
