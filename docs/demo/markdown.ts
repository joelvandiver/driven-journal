import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
});

// Parse Markdown to HTML, then sanitize to protect against injected scripts.
export function renderMarkdown(md: string): string {
  const rawHtml = marked.parse(md || '', { async: false });
  return DOMPurify.sanitize(rawHtml);
}

// Short plain-text preview for the entry list.
export function excerpt(md: string, max = 120): string {
  const text = (md || '')
    .replace(/[#*_`>~\-!\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}
