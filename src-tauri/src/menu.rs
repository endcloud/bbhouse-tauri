use tauri::{utils::assets::EmbeddedAssets, Context, Menu};

pub fn init(context: &Context<EmbeddedAssets>) -> Menu {
    // 获取应用名称
    let name = &context.package_info().name;
    Menu::os_default(name)
}