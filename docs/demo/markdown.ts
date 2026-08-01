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

export function formatSelection(value: string, action: 'bold' | 'italic' | 'code' | 'link' | 'bullet' | 'quote' | 'heading') {
  const trimmed = value.trim();

  switch (action) {
    case 'bold':
      return `**${trimmed || 'text'}**`;
    case 'italic':
      return `*${trimmed || 'text'}*`;
    case 'code':
      return `\`${trimmed || 'code'}\``;
    case 'link':
      return `[${trimmed || 'link'}](https://example.com)`;
    case 'bullet':
      return trimmed ? `- ${trimmed}` : '- ';
    case 'quote':
      return trimmed ? `> ${trimmed}` : '> ';
    case 'heading':
      return trimmed ? `# ${trimmed}` : '# ';
    default:
      return value;
  }
}

export function applyMarkdownAction(value: string, action: 'bold' | 'italic' | 'code' | 'link' | 'bullet' | 'quote' | 'heading') {
  return formatSelection(value, action);
}

// Short plain-text preview for the entry list.
export function excerpt(md: string, max = 120): string {
  const text = (md || '')
    .replace(/[#*_`>~\-!\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}
