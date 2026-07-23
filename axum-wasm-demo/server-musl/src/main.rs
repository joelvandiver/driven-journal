use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let addr: SocketAddr = std::env::var("LISTEN_ADDR")
        .unwrap_or_else(|_| "0.0.0.0:8080".to_string())
        .parse()
        .expect("LISTEN_ADDR must be a valid socket address, e.g. 0.0.0.0:8080");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| panic!("failed to bind {addr}: {e}"));

    println!("server-musl listening on http://{addr}");
    axum::serve(listener, api_core::router("musl"))
        .await
        .expect("server error");
}
