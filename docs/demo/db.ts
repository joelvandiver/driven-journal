import Dexie, { type Table } from 'dexie';

export interface Entry {
  id?: number;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface EntryInput {
  title: string;
  body: string;
}

// IndexedDB-backed store for journal entries. Everything lives in the browser.
class JournalDatabase extends Dexie {
  entries!: Table<Entry, number>;

  constructor() {
    super('driven-journal');
    this.version(1).stores({
      // ++id = auto-incrementing primary key; other fields are indexes for sorting.
      entries: '++id, title, createdAt, updatedAt',
    });
  }
}

export const db = new JournalDatabase();

function cleanTitle(title: string): string {
  const t = (title || '').trim();
  return t || 'Untitled entry';
}

export function createEntry({ title, body }: EntryInput): Promise<number> {
  const now = Date.now();
  return db.entries.add({
    title: cleanTitle(title),
    body: body || '',
    createdAt: now,
    updatedAt: now,
  });
}

export function updateEntry(id: number, { title, body }: EntryInput): Promise<number> {
  return db.entries.update(id, {
    title: cleanTitle(title),
    body: body || '',
    updatedAt: Date.now(),
  });
}

export function deleteEntry(id: number): Promise<void> {
  return db.entries.delete(id);
}

export function getEntry(id: number): Promise<Entry | undefined> {
  return db.entries.get(id);
}
