import { useEffect, useState } from 'react';
import { analyze, fetchHealth, type AnalyzeResponse } from './api';

const BACKENDS = [
  { label: 'Native (MUSL, tokio)', url: 'http://127.0.0.1:8080' },
  { label: 'WASI (wasm32-wasip2, wasmtime serve)', url: 'http://127.0.0.1:8081' },
];

type HealthState = { state: 'checking' } | { state: 'ok'; backend: string } | { state: 'error'; message: string };

export default function App() {
  const [baseUrl, setBaseUrl] = useState(BACKENDS[0].url);
  const [health, setHealth] = useState<HealthState>({ state: 'checking' });
  const [title, setTitle] = useState('Devstopian Journal');
  const [body, setBody] = useState(
    'The quick brown fox jumps over the lazy dog. The same fox came back later, ' +
      'and the dog barked twice. Rust compiled to WebAssembly runs this analysis.'
  );
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHealth({ state: 'checking' });
    fetchHealth(baseUrl)
      .then((h) => setHealth({ state: 'ok', backend: h.backend }))
      .catch((e) => setHealth({ state: 'error', message: String(e) }));
  }, [baseUrl]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      analyze(baseUrl, title, body)
        .then(setResult)
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [baseUrl, title, body]);

  return (
    <div className="app">
      <header className="header">
        <h1>Axum WASM Demo</h1>
        <p className="subtitle">
          One Axum router, two deployments: a statically-linked MUSL binary and a WASI-HTTP
          component served by <code>wasmtime serve</code>. Pick a backend below &mdash; both
          answer identically.
        </p>
      </header>

      <section className="backend-picker">
        {BACKENDS.map((b) => (
          <button
            key={b.url}
            className={`backend-btn ${baseUrl === b.url ? 'active' : ''}`}
            onClick={() => setBaseUrl(b.url)}
          >
            {b.label}
          </button>
        ))}
        <StatusBadge health={health} />
      </section>

      <main className="content">
        <div className="editor">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Body
            <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
        </div>

        <div className="results">
          <h2>Analysis {loading && <span className="loading">updating&hellip;</span>}</h2>
          {error && <p className="error">{error}</p>}
          {result && (
            <div className="stats">
              <Stat label="Answered by" value={result.backend} />
              <Stat label="Words" value={result.word_count} />
              <Stat label="Characters" value={result.char_count} />
              <Stat label="Sentences" value={result.sentence_count} />
              <Stat label="Reading time" value={`${result.reading_time_minutes} min`} />
              <div className="top-words">
                <h3>Top words</h3>
                <ul>
                  {result.top_words.map((w) => (
                    <li key={w.word}>
                      <span className="word">{w.word}</span>
                      <span className="count">{w.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function StatusBadge({ health }: { health: HealthState }) {
  if (health.state === 'checking') return <span className="badge badge-checking">checking&hellip;</span>;
  if (health.state === 'error') return <span className="badge badge-error">unreachable</span>;
  return <span className="badge badge-ok">live &middot; {health.backend}</span>;
}
