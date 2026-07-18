import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
});

// Parse Markdown to HTML, then sanitize to protect against injected scripts.
export function renderMarkdown(md) {
  const rawHtml = marked.parse(md || '');
  return DOMPurify.sanitize(rawHtml);
}

// Short plain-text preview for the entry list.
export function excerpt(md, max = 120) {
  const text = (md || '')
    .replace(/[#*_`>~\-!\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}
