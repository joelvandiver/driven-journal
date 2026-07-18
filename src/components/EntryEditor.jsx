import { useState } from 'react';
import { renderMarkdown } from '../markdown.js';

export default function EntryEditor({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [tab, setTab] = useState('write'); // 'write' | 'preview'

  const isNew = !initial;

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ title, body });
  }

  return (
    <form className="entry-editor" onSubmit={handleSubmit}>
      <div className="entry-toolbar">
        <input
          className="title-input"
          type="text"
          placeholder="Entry title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="entry-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isNew ? 'Create entry' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="editor-tabs">
        <button
          type="button"
          className={'tab' + (tab === 'write' ? ' is-active' : '')}
          onClick={() => setTab('write')}
        >
          Write
        </button>
        <button
          type="button"
          className={'tab' + (tab === 'preview' ? ' is-active' : '')}
          onClick={() => setTab('preview')}
        >
          Preview
        </button>
        <span className="editor-hint">Markdown supported</span>
      </div>

      {tab === 'write' ? (
        <textarea
          className="body-input"
          placeholder="Write your entry in Markdown…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      ) : (
        <div className="preview-pane markdown">
          {body.trim() ? (
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
            />
          ) : (
            <p className="muted">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </form>
  );
}
