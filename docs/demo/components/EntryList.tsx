import { excerpt } from '../markdown';
import type { Entry } from '../db';

interface EntryListProps {
  entries: Entry[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EntryList({ entries, selectedId, onSelect }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="list-empty">
        <p>No entries yet.</p>
        <p className="muted">Your journal starts with a single entry.</p>
      </div>
    );
  }

  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li key={entry.id}>
          <button
            className={
              'entry-item' + (entry.id === selectedId ? ' is-selected' : '')
            }
            onClick={() => onSelect(entry.id!)}
          >
            <span className="entry-item-title">{entry.title}</span>
            <span className="entry-item-date">{formatDate(entry.updatedAt)}</span>
            <span className="entry-item-excerpt">{excerpt(entry.body)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
