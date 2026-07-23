# Axum WASM Demo

One [Axum](https://github.com/tokio-rs/axum) HTTP router, deployed two ways, driven by one
React + TypeScript frontend:

- **`server-musl`** — a normal Axum + Tokio server, compiled to a fully static
  `x86_64-unknown-linux-musl` binary (the kind of binary you'd drop into a `FROM scratch`
  container).
- **`server-wasi`** — the *same* router logic, compiled to a `wasm32-wasip2` WASI-HTTP
  component and served with [`wasmtime serve`](https://docs.wasmtime.dev/cli-options.html).

Both expose an identical API. The frontend lets you flip between them live and watch the
responses match.

## Why this shape

Axum's server (`axum::serve`) needs real TCP sockets, so it can't run inside a
browser-style `wasm32-unknown-unknown` module. The standard way to run server-side Rust as
WASM today is the **WASI 0.2 Component Model**: compile to `wasm32-wasip2` against the
`wasi:http/proxy` world, and run it under a WASI-HTTP-capable host like `wasmtime serve`.
That's what `server-wasi` does, via the [`wstd`](https://github.com/bytecodealliance/wstd)
crate's `wstd-axum` integration (`#[wstd_axum::http_server]`), which adapts an
`axum::Router` directly into a WASI-HTTP guest export — no manual `wit-bindgen` glue needed.

`wasmtime serve` re-instantiates the component per request by default, so the API is
deliberately **stateless** (a text-analysis endpoint, not a database) — that way both
backends behave identically with zero surprises about state not surviving between requests.

## Layout

```
axum-wasm-demo/
  api-core/       shared lib crate: the Axum router + all handler/business logic
  server-musl/    thin bin crate: tokio TCP listener + axum::serve, targets x86_64-unknown-linux-musl
  server-wasi/    thin bin crate: #[wstd_axum::http_server], targets wasm32-wasip2
  frontend/       React + TypeScript (Vite) UI that calls either backend
```

`api-core` is the only place with real logic. `server-musl` and `server-wasi` are each ~10
lines that just mount `api_core::router(...)` on a different transport. **Each crate has its
own `Cargo.toml` and is not part of a shared Cargo workspace** — this is intentional. Cargo
unifies feature flags for a shared dependency across all workspace members that are part of
the same resolve, and `server-musl` needs `axum`'s `tokio`/`http1` features (which pull in
`tokio`'s networking, `mio`, etc. — none of which compile for `wasm32-wasip2`). Keeping the
two servers as independently-resolved crates means each only ever builds the feature set (and
dependency graph) it actually needs.

## The API

- `GET /api/health` → `{ "status": "ok", "backend": "musl" | "wasi" }`
- `POST /api/analyze` with `{ "title": string, "body": string }` → word count, character
  count, sentence count, estimated reading time, and top 5 non-trivial words by frequency.

## Running it

### 1. Native MUSL server

```sh
rustup target add x86_64-unknown-linux-musl
# Debian/Ubuntu: apt-get install musl-tools (provides musl-gcc)
cd server-musl
cargo build --release --target x86_64-unknown-linux-musl
LISTEN_ADDR=127.0.0.1:8080 ./target/x86_64-unknown-linux-musl/release/server-musl
```

Verify it's actually static: `ldd target/x86_64-unknown-linux-musl/release/server-musl` →
`statically linked`.

### 2. WASI component, served by wasmtime

```sh
rustup target add wasm32-wasip2
cargo install wasmtime-cli --locked   # or grab a prebuilt binary from wasmtime.dev
cd server-wasi
cargo build --release --target wasm32-wasip2
wasmtime serve -Scli target/wasm32-wasip2/release/server-wasi.wasm --addr 127.0.0.1:8081
```

### 3. Frontend

```sh
cd frontend
npm install
npm run dev   # http://localhost:5174
```

The UI has two preset buttons (`127.0.0.1:8080` for MUSL, `127.0.0.1:8081` for
wasmtime/WASI) and shows a live health badge plus the analysis results, so you can start
either backend (or both) and switch between them without touching the frontend.

`npm run build` / `npm run typecheck` work the same as the existing `docs/demo` app in this
repo.

## Size & startup, for reference

Measured on this machine, release builds:

| | native MUSL binary | WASI component (`.wasm`) |
|---|---|---|
| size (unstripped) | 2.0 MB | 780 KB |
| size (stripped) | 1.6 MB | — (`.wasm` isn't stripped the same way) |
| starts serving | immediately (own process, own socket) | instantiated per request by `wasmtime serve`, sandboxed, no direct socket access |

The MUSL binary is what you'd actually put in a container or bare-metal host. The WASI
component is the one that's portable across any WASI-0.2-compatible runtime (Wasmtime,
Spin, wasmCloud, ...) without recompiling, at the cost of running inside that runtime's
sandbox rather than as a standalone process.

## Relationship to the rest of this repo

This demo is fully self-contained under `axum-wasm-demo/` and doesn't touch the existing
client-only journal app in `docs/demo/` (which has no backend at all — everything there is
IndexedDB in the browser). The two are independent; this is a separate example living
alongside it.
