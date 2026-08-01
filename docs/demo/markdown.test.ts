import { describe, expect, it } from 'vitest';
import { applyMarkdownAction, formatSelection } from './markdown';

describe('markdown helpers', () => {
  it('wraps a selection in bold markdown', () => {
    expect(formatSelection('hello world', 'bold')).toBe('**hello world**');
  });

  it('wraps a selection in bullet markdown when the selection is empty', () => {
    expect(formatSelection('', 'bullet')).toBe('- ');
  });

  it('applies a heading action to a selected line', () => {
    expect(applyMarkdownAction('hello', 'heading')).toBe('# hello');
  });

  it('creates a quote block from a selected line', () => {
    expect(applyMarkdownAction('hello', 'quote')).toBe('> hello');
  });
});
