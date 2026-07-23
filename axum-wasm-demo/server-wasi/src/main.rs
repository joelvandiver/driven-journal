use axum::Router;

#[wstd_axum::http_server]
fn main() -> Router {
    api_core::router("wasi")
}
