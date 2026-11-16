import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { listarCaderno, salvarNoCaderno } from '../../services/questoes/cadernoService.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';
import '../../styles/anotacoes.css';

const LIMITE = 3000;

// Aparece na página da questão depois que o aluno erra: ele escreve por que errou e revê depois na aba Anotações.
export default function AnotacaoErro({ idQuestao, idResposta }) {
  const [texto, setTexto] = useState('');
  const [salva, setSalva] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  // Se o aluno já tinha anotado esta questão antes, mostra o texto salvo.
  useEffect(() => {
    let ativo = true;
    listarCaderno()
      .then(({ items }) => {
        const existente = items.find(i => String(i.id_questao) === String(idQuestao));
        if (ativo && existente) { setTexto(existente.anotacao || ''); setSalva(true); }
      })
      .catch(() => {});
    return () => { ativo = false; };
  }, [idQuestao]);

  async function salvar(e) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor) { setErro('Escreva por que você errou antes de salvar.'); return; }
    setSalvando(true);
    setErro('');
    setAviso('');
    try {
      await salvarNoCaderno(idQuestao, idResposta, valor);
      setSalva(true);
      setAviso('Anotação salva.');
    } catch (err) {
      setErro(mensagemErroQuestao(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="anotacao-erro" aria-labelledby="anotacao-titulo">
      <h3 id="anotacao-titulo"><Lightbulb size={18} />Por que você errou?</h3>
      <p className="anotacao-dica">Anote o motivo para revisar depois. Ela fica salva na aba “Anotações”.</p>
      <form onSubmit={salvar}>
        <textarea
          value={texto}
          onChange={e => { setTexto(e.target.value); setAviso(''); if (erro) setErro(''); }}
          maxLength={LIMITE}
          rows={5}
          placeholder="Ex.: confundi o prazo com a competência; revisar o art. 5º…"
          disabled={salvando}
        />
        <div className="anotacao-rodape">
          <span className="anotacao-contador">{texto.length}/{LIMITE}</span>
          <button type="submit" className="btn btn-primary btn-sm" disabled={salvando}>
            {salvando ? 'Salvando…' : salva ? 'Atualizar anotação' : 'Salvar anotação'}
          </button>
        </div>
        {erro && <p className="field-error" role="alert">{erro}</p>}
        {aviso && <p className="anotacao-ok" role="status">{aviso} <Link to="/aluno/anotacoes">Ver minhas anotações</Link></p>}
      </form>
    </section>
  );
}
