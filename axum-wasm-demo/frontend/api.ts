export interface HealthResponse {
  status: string;
  backend: string;
}

export interface WordFreq {
  word: string;
  count: number;
}

export interface AnalyzeResponse {
  backend: string;
  word_count: number;
  char_count: number;
  sentence_count: number;
  reading_time_minutes: number;
  top_words: WordFreq[];
}

export async function fetchHealth(baseUrl: string): Promise<HealthResponse> {
  const res = await fetch(`${baseUrl}/api/health`);
  if (!res.ok) throw new Error(`health check failed: ${res.status}`);
  return res.json();
}

export async function analyze(
  baseUrl: string,
  title: string,
  body: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) throw new Error(`analyze failed: ${res.status}`);
  return res.json();
}
