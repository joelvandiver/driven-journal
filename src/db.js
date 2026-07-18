import Dexie from 'dexie';

// IndexedDB-backed store for journal entries. Everything lives in the browser.
export const db = new Dexie('driven-journal');

db.version(1).stores({
  // ++id = auto-incrementing primary key; other fields are indexes for sorting.
  entries: '++id, title, createdAt, updatedAt',
});

function cleanTitle(title) {
  const t = (title || '').trim();
  return t || 'Untitled entry';
}

export async function createEntry({ title, body }) {
  const now = Date.now();
  return db.entries.add({
    title: cleanTitle(title),
    body: body || '',
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateEntry(id, { title, body }) {
  return db.entries.update(id, {
    title: cleanTitle(title),
    body: body || '',
    updatedAt: Date.now(),
  });
}

export async function deleteEntry(id) {
  return db.entries.delete(id);
}

export function getEntry(id) {
  return db.entries.get(id);
}
