import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AlternativaOpcao from '../../components/questoes/AlternativaOpcao.jsx';
import ResultadoQuestao from '../../components/questoes/ResultadoQuestao.jsx';
import TelaCarregando from '../../components/common/TelaCarregando.jsx';
import { buscarQuestao, responderQuestao } from '../../services/questoes/questoesService.js';
import { validarResposta } from '../../validators/questoes/respostaValidator.js';
import { mensagemErroQuestao } from '../../utils/mensagensQuestoes.js';

export default function QuestaoPage() {
  const { id } = useParams();
  const location = useLocation();
  const voltarPara = location.state?.voltarPara || '/aluno/questoes';

  const [questao, setQuestao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');
  const [selecionada, setSelecionada] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErroCarregamento('');
    setQuestao(null);
    setSelecionada(null);
    setResultado(null);
    setErroEnvio('');
    buscarQuestao(id)
      .then(dados => { if (ativo) setQuestao(dados); })
      .catch(err => { if (ativo) setErroCarregamento(mensagemErroQuestao(err)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [id]);

  async function responder(e) {
    e.preventDefault();
    const erroValidacao = validarResposta(selecionada);
    if (erroValidacao) { setErroEnvio(erroValidacao); return; }
    setEnviando(true);
    setErroEnvio('');
    try {
      setResultado(await responderQuestao(id, selecionada));
    } catch (err) {
      setErroEnvio(mensagemErroQuestao(err));
    } finally {
      setEnviando(false);
    }
  }

  // Depois da resposta: destaca o gabarito e, se o aluno errou, a alternativa escolhida.
  function statusAlternativa(alt) {
    if (!resultado) return 'neutro';
    if (alt.codigo === resultado.gabarito) return 'correta';
    if (alt.id_alternativa === selecionada) return 'errada';
    return 'neutro';
  }

  if (carregando) return <TelaCarregando texto="Carregando questão…" />;

  if (erroCarregamento || !questao) {
    return (
      <>
        <div className="alert" role="alert">{erroCarregamento || 'Questão não encontrada.'}</div>
        <Link to={voltarPara} className="link-voltar">← Voltar para a lista</Link>
      </>
    );
  }

  return (
    <article>
      <p className="breadcrumb">{questao.disciplina} · {questao.assunto}</p>
      <p className="questao-enunciado">{questao.enunciado}</p>

      <form onSubmit={responder} className="resolucao">
        <fieldset disabled={!!resultado || enviando}>
          <legend className="sr-only">Alternativas</legend>
          <div className="alternativas">
            {questao.alternativas.map(alt => (
              <AlternativaOpcao
                key={alt.id_alternativa}
                alternativa={alt}
                name={`questao-${questao.id_questao}`}
                selecionada={selecionada === alt.id_alternativa}
                status={statusAlternativa(alt)}
                disabled={!!resultado || enviando}
                onSelect={setSelecionada}
              />
            ))}
          </div>
        </fieldset>

        {erroEnvio && <div className="alert" role="alert">{erroEnvio}</div>}

        {!resultado && (
          <div className="acoes">
            <button type="submit" className="btn btn-primary btn-inline" disabled={selecionada === null || enviando}>
              {enviando ? 'Enviando…' : 'Responder'}
            </button>
          </div>
        )}
      </form>

      {resultado && <ResultadoQuestao resultado={resultado} />}

      <Link to={voltarPara} className="link-voltar">← Voltar para a lista</Link>
    </article>
  );
}
