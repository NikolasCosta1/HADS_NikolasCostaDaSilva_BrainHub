import { Link } from 'react-router-dom';
import { textoSimples } from '../../utils/sanitizar.js';
import { resumoOrigem } from '../../utils/origemQuestao.js';

const TIPOS = { MULTIPLA_ESCOLHA: 'Múltipla escolha', CERTO_ERRADO: 'Certo ou errado' };

export default function CardQuestao({ questao, voltarPara }) {
  const origem = resumoOrigem(questao);
  return (
    <Link to={`/aluno/questoes/${questao.id_questao}`} state={{ voltarPara }} className="card-questao">
      <div className="card-meta">
        <span className="badge">{questao.disciplina}</span>
        <span>{questao.assunto}</span>
        <span>{TIPOS[questao.tipo] || questao.tipo}</span>
        {origem && <span>{origem}</span>}
      </div>
      <p className="card-enunciado">{textoSimples(questao.enunciado)}</p>
    </Link>
  );
}
