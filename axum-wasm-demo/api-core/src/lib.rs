//! Shared API logic for the axum-wasm-demo.
//!
//! This crate is deliberately stateless: `server-wasi` runs as a WASI HTTP
//! component under `wasmtime serve`, which by default instantiates a fresh
//! copy of the component per request, so any in-memory state wouldn't
//! survive between requests anyway. Both the native MUSL binary and the
//! WASI component mount this exact router, so the two backends are
//! byte-for-byte identical in behavior.

use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tower_http::cors::CorsLayer;

#[derive(Clone, Copy)]
struct AppState {
    backend: &'static str,
}

/// Build the app's router. `backend` identifies which build produced this
/// router ("musl" or "wasi") so the frontend can show which one answered.
pub fn router(backend: &'static str) -> Router {
    Router::new()
        .route("/api/health", get(health))
        .route("/api/analyze", post(analyze))
        .layer(CorsLayer::permissive())
        .with_state(AppState { backend })
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    backend: &'static str,
}

async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        backend: state.backend,
    })
}

#[derive(Deserialize)]
struct AnalyzeRequest {
    #[serde(default)]
    title: String,
    #[serde(default)]
    body: String,
}

#[derive(Serialize)]
struct WordFreq {
    word: String,
    count: usize,
}

#[derive(Serialize)]
struct AnalyzeResponse {
    backend: &'static str,
    word_count: usize,
    char_count: usize,
    sentence_count: usize,
    reading_time_minutes: f64,
    top_words: Vec<WordFreq>,
}

const STOPWORDS: &[&str] = &[
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
    "in", "on", "at", "to", "of", "for", "with", "by", "from", "as", "it", "its", "this",
    "that", "these", "those", "i", "you", "we", "they", "he", "she", "him", "her", "his",
    "them", "my", "your", "our", "their", "not", "no", "so", "if", "then", "than", "there",
    "here", "just", "about", "into", "up", "out", "do", "did", "does",
];

async fn analyze(
    State(state): State<AppState>,
    Json(req): Json<AnalyzeRequest>,
) -> Json<AnalyzeResponse> {
    let text = format!("{} {}", req.title, req.body);

    let words: Vec<String> = text
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| !w.is_empty())
        .map(|w| w.to_lowercase())
        .collect();

    let word_count = words.len();
    let char_count = text.chars().filter(|c| !c.is_whitespace()).count();
    let sentence_count = text
        .split(['.', '!', '?'])
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .count();
    let reading_time_minutes = if word_count == 0 {
        0.0
    } else {
        (word_count as f64 / 200.0).max(0.05)
    };

    let mut freq: HashMap<String, usize> = HashMap::new();
    for w in &words {
        if w.len() > 2 && !STOPWORDS.contains(&w.as_str()) {
            *freq.entry(w.clone()).or_insert(0) += 1;
        }
    }
    let mut top_words: Vec<WordFreq> = freq
        .into_iter()
        .map(|(word, count)| WordFreq { word, count })
        .collect();
    top_words.sort_by(|a, b| b.count.cmp(&a.count).then_with(|| a.word.cmp(&b.word)));
    top_words.truncate(5);

    Json(AnalyzeResponse {
        backend: state.backend,
        word_count,
        char_count,
        sentence_count,
        reading_time_minutes: (reading_time_minutes * 100.0).round() / 100.0,
        top_words,
    })
}
