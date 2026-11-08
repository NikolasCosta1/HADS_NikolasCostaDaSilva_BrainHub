import HtmlSeguro from '../common/HtmlSeguro.jsx';

export default function ResultadoQuestao({ resultado }) {
  const explicacao = typeof resultado.explicacao === 'string' ? resultado.explicacao.trim() : '';
  return (
    <section className={`resultado ${resultado.acertou ? 'resultado--ok' : 'resultado--erro'}`} aria-live="polite">
      <h2>{resultado.acertou ? 'Resposta correta!' : 'Resposta incorreta'}</h2>
      <p>Gabarito: <strong>{resultado.gabarito}</strong></p>
      <div className="explicacao">
        <h3>Explicação</h3>
        {explicacao
          ? <HtmlSeguro html={explicacao} />
          : <p className="explicacao-vazia">Sem explicação cadastrada para esta questão.</p>}
      </div>
    </section>
  );
}
