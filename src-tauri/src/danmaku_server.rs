use std::collections::HashMap;
use std::error::Error;

use serde::{Deserialize, Serialize};

use scraper::{Html, Selector};

use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use reqwest::header;

use std::io::prelude::*;
use std::{io, thread};
use flate2::read::DeflateDecoder;
use serde_json::json;
use crate::proxy;

// Uncompresses a Deflate Encoded vector of bytes and returns a string or error
fn decode_reader(bytes: Vec<u8>) -> io::Result<String> {
    let mut deflater = DeflateDecoder::new(&bytes[..]);
    let mut s = String::new();
    deflater.read_to_string(&mut s)?;
    Ok(s)
}

#[derive(Debug, Serialize)]
struct Danmaku(f64, u8, i32, String, String);
// 定义返回数据结构体
#[derive(Serialize)]
struct ResponseData {
    code: i32,
    data: Vec<Danmaku>,
}

#[get("/v3/bilibili")]
async fn bilibili_handler(info: web::Query<HashMap<String, String>>) -> Result<HttpResponse, Box<dyn Error>> {
    let mut url = "https://api.bilibili.com/x/v1/dm/list.so?".to_owned();
    if let Some(cid) = info.get("cid") {
        url.push_str(&format!("oid={}", cid));
    }

    let response = reqwest::Client::new()
        .get(&url)
        .header(header::USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")
        .header(header::REFERER, "https://www.bilibili.com/")
        .header(header::ORIGIN, "https://www.bilibili.com")
        .header(header::ACCEPT_ENCODING, "gzip, deflate, br")
        .send()
        .await?;
    //show response headers
    // println!("{:?}", response.headers());
    let response_bytes = response.bytes().await?;
    // let result = String::from_utf8_lossy(&response_bytes).to_string();
    let result = decode_reader(response_bytes.to_vec())?;

    let document = Html::parse_document(result.replace('\r', "").replace('\n', "").as_str());
    let selector = Selector::parse("d").unwrap();
    let data: Vec<Danmaku> = document
        .select(&selector)
        .map(|el| {
            let p: Vec<&str> = el.value().attr("p").unwrap().split(",").collect();
            let type_val = match p[1] {
                "4" => 2,
                "5" => 1,
                _ => 0,
            };
            Danmaku(
                p[0].parse::<f64>().unwrap(),
                type_val,
                p[3].parse::<i32>().unwrap(),
                p[6].to_string(),
                el.inner_html(),
            )
        })
        .collect();

    // 在控制台输出请求的URL和响应的内容
    println!("请求链接: {}", url);
    println!("响应内容: {:?}", result.len());

    // 定义返回数据
    let resp_data = ResponseData {
        code: 0,
        data,
    };

    let mut response = HttpResponse::Ok().json(resp_data);
    response.headers_mut().insert("Access-Control-Allow-Origin".parse().unwrap(), "*".parse().unwrap());


    Ok(response)
}

async fn default() -> impl Responder {
    let mut response = HttpResponse::Ok().json(json!({"code": 0, "data": []}));
    response.headers_mut().insert("Access-Control-Allow-Origin".parse().unwrap(), "*".parse().unwrap());

    response
}

#[actix_web::main]
pub async fn main() -> Result<(), Box<dyn Error>> {
    HttpServer::new(|| App::new().service(bilibili_handler).default_service(web::to(default)))
        .bind("127.0.0.1:29418")?
        .run()
        .await?;

    Ok(())
}