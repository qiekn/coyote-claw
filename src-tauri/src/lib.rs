mod ws;

use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

use tauri::{Emitter, Manager};
use ws::message::ServerEvent;
use ws::protocol::ConnectionStatus;
use ws::server::WsServer;

/// 应用共享状态
pub struct AppState {
    pub server: WsServer,
    pub event_rx: Arc<Mutex<mpsc::UnboundedReceiver<ServerEvent>>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    let port = 9999u16;
    let (event_tx, event_rx) = mpsc::unbounded_channel();
    let server = WsServer::new(port, event_tx);
    let state = AppState {
        server: server.clone(),
        event_rx: Arc::new(Mutex::new(event_rx)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(state)
        .setup(move |app| {
            // 启动 WS Server
            let server = server.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = ws::server::start_server(server).await {
                    log::error!("WS Server error: {}", e);
                }
            });

            // 启动事件转发到前端
            let handle = app.handle().clone();
            let event_rx = app.state::<AppState>().event_rx.clone();
            tauri::async_runtime::spawn(async move {
                let mut rx = event_rx.lock().await;
                while let Some(event) = rx.recv().await {
                    match event {
                        ServerEvent::StatusChanged(_id, status) => {
                            let _ = handle.emit("ws:connection-status", &status);
                        }
                        ServerEvent::StrengthUpdate(fb) => {
                            let payload = serde_json::json!({
                                "a": fb.a_strength,
                                "b": fb.b_strength,
                                "aLimit": fb.a_limit,
                                "bLimit": fb.b_limit,
                            });
                            let _ = handle.emit("ws:strength-update", &payload);
                        }
                        ServerEvent::Feedback(msg) => {
                            let _ = handle.emit("ws:feedback", &msg);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_qrcode_url,
            send_strength,
            send_waveform,
            clear_waveform,
            get_connection_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// --- Tauri Commands ---

#[tauri::command]
fn get_qrcode_url(state: tauri::State<AppState>) -> String {
    // 本地模式使用 localhost
    state.server.qrcode_url("127.0.0.1")
}

#[tauri::command]
async fn send_strength(
    state: tauri::State<'_, AppState>,
    channel: u32,
    mode: u32,
    value: u32,
) -> Result<(), String> {
    let server = &state.server;
    let target_id = server
        .connections
        .get_partner(&server.client_id)
        .await
        .ok_or("未配对")?;

    let msg = serde_json::to_string(&serde_json::json!({
        "type": "msg",
        "clientId": server.client_id,
        "targetId": target_id,
        "message": format!("strength-{}+{}+{}", channel, mode, value.min(200)),
    }))
    .unwrap();

    server
        .connections
        .send_to(&target_id, &msg)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn send_waveform(
    state: tauri::State<'_, AppState>,
    channel: String,
    waveform: String,
) -> Result<(), String> {
    let server = &state.server;
    let target_id = server
        .connections
        .get_partner(&server.client_id)
        .await
        .ok_or("未配对")?;

    let msg = serde_json::to_string(&serde_json::json!({
        "type": "msg",
        "clientId": server.client_id,
        "targetId": target_id,
        "message": format!("pulse-{}:{}", channel, waveform),
    }))
    .unwrap();

    server
        .connections
        .send_to(&target_id, &msg)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn clear_waveform(
    state: tauri::State<'_, AppState>,
    channel: u32,
) -> Result<(), String> {
    let server = &state.server;
    let target_id = server
        .connections
        .get_partner(&server.client_id)
        .await
        .ok_or("未配对")?;

    let msg = serde_json::to_string(&serde_json::json!({
        "type": "msg",
        "clientId": server.client_id,
        "targetId": target_id,
        "message": format!("clear-{}", channel),
    }))
    .unwrap();

    server
        .connections
        .send_to(&target_id, &msg)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_connection_status(state: tauri::State<'_, AppState>) -> Result<ConnectionStatus, ()> {
    Ok(state
        .server
        .connections
        .get_status(&state.server.client_id)
        .await)
}
