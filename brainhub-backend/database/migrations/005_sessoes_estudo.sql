-- Sessões de estudo: título e assunto livre (opcional), sem exigir assunto do catálogo.
ALTER TABLE sessao_estudo ADD COLUMN IF NOT EXISTS titulo VARCHAR(150);
ALTER TABLE sessao_estudo ADD COLUMN IF NOT EXISTS assunto_texto VARCHAR(150);
ALTER TABLE sessao_estudo ALTER COLUMN id_assunto DROP NOT NULL;
