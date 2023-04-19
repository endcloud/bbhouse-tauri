use std::net::SocketAddr;
use std::sync::Arc;

use anyhow::*;
use hyper::{Body, Client, Request, Response, Server, StatusCode, Uri};
use hyper::service::{make_service_fn, service_fn};

fn req_crate(req: &mut Request<Body>) -> Result<()> {
    for key in &["host", "referer", "user-agent"] {
        req.headers_mut().remove(*key);
    }
    req.headers_mut().insert("host", "upos-sz-mirrorcoso1.bilivideo.com".parse()?);
    req.headers_mut().insert("referer", "https://www.bilibili.com/".parse()?);
    req.headers_mut().insert("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15".parse()?);

    let uri = req.uri();
    let uri_string = match uri.query() {
        Some(query_item) => format!("https://upos-sz-mirrorcoso1.bilivideo.com{}?{}", uri.path(), query_item),
        None => format!("https://upos-sz-mirrorcoso1.bilivideo.com{}", uri.path())
    };

    *req.uri_mut() = uri_string.parse().context("Parsing URI Error")?;

    // for header in req.headers().iter() {
    //     println!("{}: {}", header.0, header.1.to_str()?)
    // }
    Ok(())
}

fn resp_crate(resp: &mut Response<Body>) -> Result<()> {
    for key in &["content-type", "access-control-allow-origin"] {
        resp.headers_mut().remove(*key);
    }
    resp.headers_mut().insert("content-type", "video/mp4".parse()?);
    resp.headers_mut().insert("access-control-allow-origin", "*".parse()?);

    Ok(())
}

#[tokio::main]
pub(crate) async fn main() -> Result<()> {
    let https = hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .https_only()
        .enable_http1()
        .build();
    let client: Client<_, Body> = Client::builder().build(https);
    let client: Arc<Client<_, Body>> = Arc::new(client);

    let addr = SocketAddr::from(([127, 0, 0, 1], 29417));
    // A `Service` is needed for every connection, so this
    // creates one from our `hello_world` function.
    let make_svc = make_service_fn(move |_| {
        // service_fn converts our function into a `Service`
        let client = Arc::clone(&client);
        async move {
            Ok(service_fn(
                move |mut req| {
                    let client = Arc::clone(&client);
                    async move {
                        println!("proxy: {}", req.uri().path());
                        req_crate(&mut req)?;
                        let resp = client.request(req).await.context("proxy request");
                        let mut resp: Response<Body> = match resp {
                            Result::Ok(res) => res,
                            Err(_) => {
                                Response::new(Body::from("proxy Error"))
                            }
                        };
                        resp_crate(&mut resp)?;
                        Ok(resp)
                    }
                }
            )
            )
        }
    });
    let _server = Server::bind(&addr).serve(make_svc).await.context("Run server");

    // tokio::task::spawn_blocking(|| {
    //     inner_example();
    // }).await.expect("Task panicked");


    Ok(())
}