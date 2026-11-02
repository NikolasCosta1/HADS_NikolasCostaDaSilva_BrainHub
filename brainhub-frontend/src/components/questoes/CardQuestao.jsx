import { Link } from 'react-router-dom';

const TIPOS = { MULTIPLA_ESCOLHA: 'Múltipla escolha', CERTO_ERRADO: 'Certo ou errado' };

export default function CardQuestao({ questao, voltarPara }) {
  return (
    <Link to={`/aluno/questoes/${questao.id_questao}`} state={{ voltarPara }} className="card-questao">
      <div className="card-meta">
        <span className="badge">{questao.disciplina}</span>
        <span>{questao.assunto}</span>
        <span>{TIPOS[questao.tipo] || questao.tipo}</span>
      </div>
      <p className="card-enunciado">{questao.enunciado}</p>
    </Link>
  );
}
