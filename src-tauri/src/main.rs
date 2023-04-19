#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use std::thread;

use libloading::{Library, Symbol};

mod proxy;
mod menu;
mod danmaku_server;

#[tauri::command]
async fn start_proxy() {
    println!("rust proxy");
    thread::spawn(|| {
        proxy::main();
    });
}

#[tauri::command]
async fn start_danmaku_server() {
    println!("rust danmaku");
    thread::spawn(|| {
        danmaku_server::main();
    });
}

fn load_dll() {
    // 从本地加载DLL文件
    unsafe {
        let lib = Library::new("./HelloDll.dll").unwrap();
        println!("{:?}", lib);
        let func: Symbol<unsafe extern "C" fn() -> u32> = lib.get(b"Test").unwrap();
        println!("{}", func());
    }
}

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        // .menu(menu::init(&context)) // ✅ 将菜单添加到所有窗口
        .invoke_handler(tauri::generate_handler![start_proxy, start_danmaku_server])
        .run(context)
        .expect("error while running tauri application");
}


