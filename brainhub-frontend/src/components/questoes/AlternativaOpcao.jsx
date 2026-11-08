import HtmlSeguro from '../common/HtmlSeguro.jsx';

export default function AlternativaOpcao({ alternativa, name, selecionada, status = 'neutro', disabled, onSelect }) {
  const id = `${name}-${alternativa.id_alternativa}`;
  const classes = [
    'alternativa',
    selecionada && 'alternativa--selecionada',
    status === 'correta' && 'alternativa--correta',
    status === 'errada' && 'alternativa--errada',
  ].filter(Boolean).join(' ');

  return (
    <label htmlFor={id} className={classes}>
      <input
        id={id}
        type="radio"
        name={name}
        value={alternativa.id_alternativa}
        checked={selecionada}
        disabled={disabled}
        onChange={() => onSelect(alternativa.id_alternativa)}
      />
      <span className="alternativa-codigo">{alternativa.codigo})</span>
      <HtmlSeguro as="span" className="alternativa-texto" html={alternativa.texto} />
    </label>
  );
}
