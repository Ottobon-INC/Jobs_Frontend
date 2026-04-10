// SECURITY: HTML sanitizer — OWASP A03:2021 Injection Prevention
// All HTML from external sources MUST pass through this before rendering.
import DOMPurify from 'dompurify';

/** Sanitize HTML — strips scripts, event handlers, dangerous elements */
export const sanitizeHTML = (dirty) => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote',
                    'pre', 'code', 'hr', 'img', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt',
                    'colspan', 'rowspan'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],        // Allow target="_blank" on links
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
  });
};
