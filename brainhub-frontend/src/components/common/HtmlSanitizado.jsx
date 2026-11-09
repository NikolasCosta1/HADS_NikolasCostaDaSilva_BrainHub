import DOMPurify from 'dompurify';

// Enunciado, alternativas e explicação podem vir com HTML quando a questão
// é importada da Quest API. Único ponto de sanitização do front: lista de
// tags e atributos permitidos, nada de scripts ou handlers inline.
const CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'ul', 'ol', 'li', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'],
  ALLOWED_ATTR: ['src', 'alt', 'width', 'height'],
};

export default function HtmlSanitizado({ html, as: Tag = 'div', className }) {
  const limpo = DOMPurify.sanitize(html || '', CONFIG);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: limpo }} />;
}
