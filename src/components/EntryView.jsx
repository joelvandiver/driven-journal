import { useState } from 'react';
import { renderMarkdown } from '../markdown.js';

function formatDateTime(ts) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

export default function EntryView({ entry, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <article className="entry-view">
      <div className="entry-toolbar">
        <div className="entry-meta">
          <span title={`Created ${formatDateTime(entry.createdAt)}`}>
            Updated {formatDateTime(entry.updatedAt)}
          </span>
        </div>
        <div className="entry-actions">
          <button className="btn" onClick={onEdit}>
            Edit
          </button>
          {confirming ? (
            <>
              <button className="btn btn-danger" onClick={onDelete}>
                Confirm delete
              </button>
              <button className="btn" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button
              className="btn btn-ghost-danger"
              onClick={() => setConfirming(true)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <h1 className="entry-title">{entry.title}</h1>
      <div
        className="entry-body markdown"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.body) }}
      />
    </article>
  );
}
