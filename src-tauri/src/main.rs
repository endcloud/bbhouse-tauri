#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use std::thread;
use libloading::{Library, Symbol};

mod proxy;
mod menu;

#[tauri::command]
async fn start_proxy() {
    thread::spawn(|| {
        proxy::main();
    }).join().expect("Thread proxy");
}

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        // .menu(menu::init(&context)) // ✅ 将菜单添加到所有窗口
        .invoke_handler(tauri::generate_handler![start_proxy])
        .run(context)
        .expect("error while running tauri application");
}


