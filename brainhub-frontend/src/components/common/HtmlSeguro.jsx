import { sanitizarHtml, temHtml } from '../../utils/sanitizar.js';

// Único ponto do app que usa dangerouslySetInnerHTML, sempre depois da sanitização.
export default function HtmlSeguro({ html, as: Tag = 'div', className = '' }) {
  const texto = String(html ?? '');
  if (!temHtml(texto)) return <Tag className={`${className} texto-puro`.trim()}>{texto}</Tag>;
  return <Tag className={`${className} html-seguro`.trim()} dangerouslySetInnerHTML={{ __html: sanitizarHtml(texto) }} />;
}
