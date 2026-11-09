-- Campos para espelhar questões da Quest API sem substituir o histórico local.
ALTER TABLE questao ALTER COLUMN id_administrador DROP NOT NULL;
ALTER TABLE questao ADD COLUMN IF NOT EXISTS fonte VARCHAR(20) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE questao ADD COLUMN IF NOT EXISTS codigo_externo VARCHAR(100);
ALTER TABLE questao ADD COLUMN IF NOT EXISTS metadados_fonte JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS questao_fonte_codigo_externo
 ON questao (fonte, codigo_externo) WHERE codigo_externo IS NOT NULL;

ALTER TABLE alternativa ALTER COLUMN codigo TYPE VARCHAR(10);
ALTER TABLE alternativa DROP CONSTRAINT IF EXISTS alternativa_codigo_check;
ALTER TABLE alternativa ADD CONSTRAINT alternativa_codigo_check CHECK (length(trim(codigo)) > 0);
ALTER TABLE gabarito ALTER COLUMN explicacao DROP NOT NULL;
ALTER TABLE gabarito DROP CONSTRAINT IF EXISTS gabarito_explicacao_check;
