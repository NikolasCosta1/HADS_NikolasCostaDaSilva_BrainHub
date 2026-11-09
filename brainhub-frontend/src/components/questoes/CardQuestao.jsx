import { Link } from 'react-router-dom';
import HtmlSanitizado from '../common/HtmlSanitizado.jsx';

const TIPOS = { MULTIPLA_ESCOLHA: 'Múltipla escolha', CERTO_ERRADO: 'Certo ou errado' };

export default function CardQuestao({ questao, voltarPara }) {
  const prova = questao.metadados_fonte?.provas?.[0] || {};
  return (
    <Link to={`/aluno/questoes/${questao.id_questao}`} state={{ voltarPara }} className="card-questao">
      <div className="card-meta">
        <span className="badge">{questao.disciplina}</span>
        <span>{questao.assunto}</span>
        <span>{TIPOS[questao.tipo] || questao.tipo}</span>
        {prova.banca && <span className="chip">{prova.banca}</span>}
        {prova.ano && <span className="chip">{prova.ano}</span>}
      </div>
      <HtmlSanitizado html={questao.enunciado} as="p" className="card-enunciado" />
    </Link>
  );
}
