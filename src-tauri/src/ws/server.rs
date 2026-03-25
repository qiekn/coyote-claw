use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;

use futures_util::{SinkExt, StreamExt};
use log::{error, info};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;

use crate::ws::message::{handle_message, ServerEvent};
use crate::ws::protocol::{ConnectionStatus, MessageType, WsMessage};

/// WS Server 状态 — 简单模型，只管理一个 APP 连接
#[derive(Clone)]
pub struct WsServer {
    pub client_id: String,
    pub port: u16,
    pub event_tx: mpsc::UnboundedSender<ServerEvent>,
    /// APP 端的发送通道
    pub app_tx: Arc<Mutex<Option<mpsc::UnboundedSender<String>>>>,
    /// APP 分配的 ID
    pub app_id: Arc<Mutex<Option<String>>>,
    /// 当前连接状态
    pub status: Arc<Mutex<ConnectionStatus>>,
}

impl WsServer {
    pub fn new(port: u16, event_tx: mpsc::UnboundedSender<ServerEvent>) -> Self {
        let client_id = Uuid::new_v4().to_string();
        info!("Generated clientId: {}", client_id);
        Self {
            client_id,
            port,
            event_tx,
            app_tx: Arc::new(Mutex::new(None)),
            app_id: Arc::new(Mutex::new(None)),
            status: Arc::new(Mutex::new(ConnectionStatus::Disconnected)),
        }
    }

    pub fn qrcode_url(&self, host: &str) -> String {
        format!(
            "https://www.dungeon-lab.com/app-download.php#DGLAB-SOCKET#ws://{}:{}/{}",
            host, self.port, self.client_id
        )
    }

    /// 发送消息到 APP
    pub async fn send_to_app(&self, message: &str) -> Result<(), String> {
        let tx = self.app_tx.lock().await;
        match tx.as_ref() {
            Some(tx) => tx.send(message.to_string()).map_err(|e| e.to_string()),
            None => Err("APP 未连接".to_string()),
        }
    }

    pub async fn get_status(&self) -> ConnectionStatus {
        self.status.lock().await.clone()
    }

    pub async fn set_status(&self, s: ConnectionStatus) {
        *self.status.lock().await = s.clone();
        let _ = self.event_tx.send(ServerEvent::StatusChanged(s));
    }
}

/// 启动 WebSocket 服务器
pub async fn start_server(server: WsServer) -> Result<(), Box<dyn std::error::Error>> {
    let addr = format!("0.0.0.0:{}", server.port);
    let listener = TcpListener::bind(&addr).await?;
    info!("WebSocket server listening on {}", addr);

    server.set_status(ConnectionStatus::WaitingForApp).await;

    while let Ok((stream, addr)) = listener.accept().await {
        let server = server.clone();
        tokio::spawn(handle_connection(server, stream, addr));
    }

    Ok(())
}

/// 处理单个 APP WebSocket 连接 (对标 C++ TUI 的 OnClientMessage)
async fn handle_connection(server: WsServer, stream: TcpStream, addr: SocketAddr) {
    let ws_stream = match tokio_tungstenite::accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            error!("WebSocket handshake failed from {}: {}", addr, e);
            return;
        }
    };

    info!("New connection from {}", addr);

    // 分配 APP ID (对标 C++ 的 app_id = GenerateUUID())
    let app_id = Uuid::new_v4().to_string();

    // 注册 APP 发送通道
    let (msg_tx, mut msg_rx) = mpsc::unbounded_channel::<String>();
    {
        *server.app_tx.lock().await = Some(msg_tx);
        *server.app_id.lock().await = Some(app_id.clone());
    }

    server.set_status(ConnectionStatus::AppConnected).await;

    // 发送初始 bind 消息: 告知 APP 它的 targetId
    // 对标 C++: Protocol::BuildMessage("bind", app_id, "", "targetId")
    let bind_msg = serde_json::to_string(&WsMessage {
        msg_type: MessageType::Str("bind".into()),
        client_id: app_id.clone(),
        target_id: String::new(),
        message: "targetId".into(),
    })
    .unwrap();

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    info!("Sending initial bind to APP: {}", bind_msg);

    if ws_sender
        .send(Message::Text(bind_msg.into()))
        .await
        .is_err()
    {
        error!("Failed to send initial bind message");
        *server.app_tx.lock().await = None;
        *server.app_id.lock().await = None;
        server.set_status(ConnectionStatus::WaitingForApp).await;
        return;
    }

    info!("Assigned APP ID: {}", app_id);

    let server_recv = server.clone();
    let app_id_recv = app_id.clone();

    // 接收 APP 消息
    let recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_receiver.next().await {
            match msg {
                Message::Text(text) => {
                    handle_message(&server_recv, &app_id_recv, &text).await;
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // 发送消息到 APP (从内部队列)
    let send_task = tokio::spawn(async move {
        while let Some(msg) = msg_rx.recv().await {
            if ws_sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    tokio::select! {
        _ = recv_task => {},
        _ = send_task => {},
    }

    // APP 断开
    info!("APP disconnected: {} ({})", app_id, addr);
    {
        *server.app_tx.lock().await = None;
        *server.app_id.lock().await = None;
    }
    server.set_status(ConnectionStatus::WaitingForApp).await;
}
