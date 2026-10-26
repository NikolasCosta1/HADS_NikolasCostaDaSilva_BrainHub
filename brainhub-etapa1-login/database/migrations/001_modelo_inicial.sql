-- PostgreSQL. Executar uma única vez em banco vazio; sem comandos destrutivos.
BEGIN;
CREATE TABLE usuario (
 id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 nome VARCHAR(150) NOT NULL CHECK (length(trim(nome)) > 0),
 email VARCHAR(254) NOT NULL,
 senha_hash TEXT NOT NULL,
 perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('ALUNO','ADMINISTRADOR')),
 ativo BOOLEAN NOT NULL DEFAULT TRUE,
 tentativas_falhas SMALLINT NOT NULL DEFAULT 0 CHECK (tentativas_falhas >= 0),
 bloqueado_ate TIMESTAMPTZ,
 criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX usuario_email_unico ON usuario (lower(trim(email)));
CREATE TABLE disciplina (
 id_disciplina BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 nome VARCHAR(100) NOT NULL UNIQUE CHECK (length(trim(nome)) > 0),
 descricao TEXT,
 ativo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE assunto (
 id_assunto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_disciplina BIGINT NOT NULL REFERENCES disciplina ON DELETE RESTRICT,
 nome VARCHAR(150) NOT NULL CHECK (length(trim(nome)) > 0),
 descricao TEXT,
 ativo BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE (id_disciplina, nome)
);
CREATE TABLE sessao_estudo (
 id_sessao BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_usuario BIGINT NOT NULL REFERENCES usuario ON DELETE RESTRICT,
 id_assunto BIGINT NOT NULL REFERENCES assunto ON DELETE RESTRICT,
 data_estudo DATE NOT NULL,
 duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
 observacoes TEXT,
 criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE material_estudo (
 id_material BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_sessao BIGINT NOT NULL REFERENCES sessao_estudo ON DELETE RESTRICT,
 titulo VARCHAR(150) NOT NULL,
 tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ARQUIVO','LINK','ANOTACAO')),
 caminho_arquivo TEXT,
 url TEXT,
 anotacao TEXT,
 nome_original VARCHAR(255),
 mime_type VARCHAR(100),
 tamanho_bytes BIGINT CHECK (tamanho_bytes >= 0),
 criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK (
  (tipo='ARQUIVO' AND nullif(trim(caminho_arquivo),'') IS NOT NULL AND url IS NULL AND anotacao IS NULL)
  OR (tipo='LINK' AND nullif(trim(url),'') IS NOT NULL AND caminho_arquivo IS NULL AND anotacao IS NULL)
  OR (tipo='ANOTACAO' AND nullif(trim(anotacao),'') IS NOT NULL AND caminho_arquivo IS NULL AND url IS NULL)
 )
);
CREATE TABLE questao (
 id_questao BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_assunto BIGINT NOT NULL REFERENCES assunto ON DELETE RESTRICT,
 id_administrador BIGINT NOT NULL REFERENCES usuario ON DELETE RESTRICT,
 enunciado TEXT NOT NULL CHECK (length(trim(enunciado)) > 0),
 tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('MULTIPLA_ESCOLHA','CERTO_ERRADO')),
 ativa BOOLEAN NOT NULL DEFAULT FALSE,
 criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE alternativa (
 id_alternativa BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_questao BIGINT NOT NULL REFERENCES questao ON DELETE RESTRICT,
 codigo CHAR(1) NOT NULL CHECK (codigo IN ('A','B','C','D','E')),
 texto TEXT NOT NULL CHECK (length(trim(texto)) > 0),
 UNIQUE (id_questao, codigo),
 UNIQUE (id_questao, id_alternativa)
);
CREATE TABLE gabarito (
 id_questao BIGINT PRIMARY KEY REFERENCES questao ON DELETE RESTRICT,
 id_alternativa_correta BIGINT NOT NULL,
 explicacao TEXT NOT NULL CHECK (length(trim(explicacao)) > 0),
 FOREIGN KEY (id_questao, id_alternativa_correta)
  REFERENCES alternativa (id_questao, id_alternativa) ON DELETE RESTRICT
);
CREATE TABLE resposta (
 id_resposta BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_usuario BIGINT NOT NULL REFERENCES usuario ON DELETE RESTRICT,
 id_questao BIGINT NOT NULL REFERENCES questao ON DELETE RESTRICT,
 id_alternativa BIGINT NOT NULL,
 acertou BOOLEAN NOT NULL,
 respondida_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (id_questao, id_alternativa)
  REFERENCES alternativa (id_questao, id_alternativa) ON DELETE RESTRICT
);
CREATE TABLE log_autenticacao (
 id_log BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 id_usuario BIGINT REFERENCES usuario ON DELETE RESTRICT,
 evento VARCHAR(30) NOT NULL,
 sucesso BOOLEAN NOT NULL,
 endereco_ip INET,
 ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX sessao_usuario_data ON sessao_estudo (id_usuario, data_estudo);
CREATE INDEX questao_assunto_ativa ON questao (id_assunto, ativa);
CREATE INDEX resposta_usuario_data ON resposta (id_usuario, respondida_em);
CREATE INDEX resposta_questao ON resposta (id_questao);
COMMIT;
