import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createEntry, updateEntry, deleteEntry } from './db.js';
import EntryList from './components/EntryList.jsx';
import EntryView from './components/EntryView.jsx';
import EntryEditor from './components/EntryEditor.jsx';

// Right-pane modes: 'empty' | 'view' | 'edit' | 'new'
export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('empty');

  const entries = useLiveQuery(
    () => db.entries.orderBy('updatedAt').reverse().toArray(),
    [],
    []
  );

  const selected = entries.find((e) => e.id === selectedId) || null;

  function handleNew() {
    setSelectedId(null);
    setMode('new');
  }

  function handleSelect(id) {
    setSelectedId(id);
    setMode('view');
  }

  async function handleSave({ title, body }) {
    if (mode === 'new') {
      const id = await createEntry({ title, body });
      setSelectedId(id);
    } else if (selectedId != null) {
      await updateEntry(selectedId, { title, body });
    }
    setMode('view');
  }

  async function handleDelete(id) {
    await deleteEntry(id);
    if (id === selectedId) {
      setSelectedId(null);
      setMode('empty');
    }
  }

  function handleCancel() {
    setMode(selectedId != null ? 'view' : 'empty');
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1 className="brand">
            <span className="brand-mark">✦</span> Devstopian Journal
          </h1>
          <button className="btn btn-primary btn-new" onClick={handleNew}>
            + New entry
          </button>
        </header>
        <EntryList
          entries={entries}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <footer className="sidebar-footer">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · stored
          in your browser
        </footer>
      </aside>

      <main className="content">
        {(mode === 'new' || mode === 'edit') && (
          <EntryEditor
            key={mode === 'edit' ? `edit-${selectedId}` : 'new'}
            initial={mode === 'edit' ? selected : null}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {mode === 'view' && selected && (
          <EntryView
            entry={selected}
            onEdit={() => setMode('edit')}
            onDelete={() => handleDelete(selected.id)}
          />
        )}

        {mode === 'empty' && (
          <div className="empty-state">
            <div className="empty-mark">✦</div>
            <h2>Nothing selected</h2>
            <p>Pick an entry from the list, or start a new one.</p>
            <button className="btn btn-primary" onClick={handleNew}>
              + New entry
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
