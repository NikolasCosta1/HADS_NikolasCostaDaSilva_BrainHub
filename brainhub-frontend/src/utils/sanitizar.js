import DOMPurify from 'dompurify';

// O enunciado e as alternativas da Quest API chegam com HTML. Só estas tags e atributos passam.
const TAGS = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'ul', 'ol', 'li', 'blockquote',
  'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'a', 'pre', 'code'];
const ATRIBUTOS = ['href', 'src', 'alt', 'colspan', 'rowspan', 'title'];

DOMPurify.addHook('afterSanitizeAttributes', (no) => {
  if (no.tagName === 'A') { no.setAttribute('target', '_blank'); no.setAttribute('rel', 'noopener noreferrer'); }
});

export function sanitizarHtml(html) {
  return DOMPurify.sanitize(String(html ?? ''), {
    ALLOWED_TAGS: TAGS,
    ALLOWED_ATTR: ATRIBUTOS,
    ALLOW_DATA_ATTR: false,
  });
}

// Texto puro (questões locais) mantém as quebras de linha; HTML não precisa disso.
export const temHtml = (texto) => /<\/?[a-z][\s\S]*?>/i.test(String(texto ?? ''));

// Versão sem tags, para prévias de uma ou duas linhas.
export function textoSimples(html) {
  const limpo = DOMPurify.sanitize(String(html ?? ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  const div = document.createElement('div');
  div.innerHTML = limpo;
  return (div.textContent || '').replace(/\s+/g, ' ').trim();
}
