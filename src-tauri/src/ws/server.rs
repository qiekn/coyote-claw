use std::net::SocketAddr;

use futures_util::{SinkExt, StreamExt};
use log::{error, info};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;

use crate::ws::connection::{ConnectionManager, Role};
use crate::ws::message::{handle_message, ServerEvent};
use crate::ws::protocol::{
    ConnectionStatus, ErrorCode, MessageType, WsMessage,
};

/// WS Server 状态
#[derive(Debug, Clone)]
pub struct WsServer {
    pub connections: ConnectionManager,
    pub client_id: String,
    pub port: u16,
    pub event_tx: mpsc::UnboundedSender<ServerEvent>,
}

impl WsServer {
    pub fn new(port: u16, event_tx: mpsc::UnboundedSender<ServerEvent>) -> Self {
        let client_id = Uuid::new_v4().to_string();
        info!("Generated clientId: {}", client_id);
        Self {
            connections: ConnectionManager::new(),
            client_id,
            port,
            event_tx,
        }
    }

    /// 获取二维码 URL
    pub fn qrcode_url(&self, host: &str) -> String {
        format!(
            "https://www.dungeon-lab.com/app-download.php#DGLAB-SOCKET#ws://{}:{}/{}",
            host, self.port, self.client_id
        )
    }
}

/// 启动 WebSocket 服务器
pub async fn start_server(server: WsServer) -> Result<(), Box<dyn std::error::Error>> {
    let addr = format!("0.0.0.0:{}", server.port);
    let listener = TcpListener::bind(&addr).await?;
    info!("WebSocket server listening on {}", addr);

    // 注册 client 自身 (本地控制器)
    let (local_tx, _local_rx) = mpsc::unbounded_channel();
    server
        .connections
        .register(server.client_id.clone(), Role::Client, local_tx)
        .await;

    // 通知前端: 等待 APP 连接
    let _ = server.event_tx.send(ServerEvent::StatusChanged(
        server.client_id.clone(),
        ConnectionStatus::WaitingForApp,
    ));

    while let Ok((stream, addr)) = listener.accept().await {
        let server = server.clone();
        tokio::spawn(handle_connection(server, stream, addr));
    }

    Ok(())
}

/// 处理单个 WebSocket 连接
async fn handle_connection(server: WsServer, stream: TcpStream, addr: SocketAddr) {
    let ws_stream = match tokio_tungstenite::accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            error!("WebSocket handshake failed from {}: {}", addr, e);
            return;
        }
    };

    // 从 URL path 提取 clientId (APP 连接时使用)
    // 这里简化处理：所有新连接都作为 target 注册
    let target_id = Uuid::new_v4().to_string();
    info!("New target connection from {}: {}", addr, target_id);

    let (msg_tx, mut msg_rx) = mpsc::unbounded_channel::<String>();
    server
        .connections
        .register(target_id.clone(), Role::Target, msg_tx)
        .await;

    // 发送 bind 初始消息 (告知 targetId)
    let bind_msg = serde_json::to_string(&WsMessage {
        msg_type: MessageType::Str("bind".into()),
        client_id: String::new(),
        target_id: target_id.clone(),
        message: "targetId".into(),
    })
    .unwrap();

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    // 发送初始 bind 消息
    if ws_sender.send(Message::Text(bind_msg.into())).await.is_err() {
        let _ = server.connections.remove(&target_id).await;
        return;
    }

    let connections = server.connections.clone();
    let event_tx = server.event_tx.clone();
    let tid = target_id.clone();

    // 接收消息任务
    let recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_receiver.next().await {
            match msg {
                Message::Text(text) => {
                    handle_message(&tid, &text, &connections, &event_tx).await;
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // 发送消息任务 (从内部队列发送到 WebSocket)
    let send_task = tokio::spawn(async move {
        while let Some(msg) = msg_rx.recv().await {
            if ws_sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    // 等待任一任务结束
    tokio::select! {
        _ = recv_task => {},
        _ = send_task => {},
    }

    // 清理连接
    info!("Connection closed: {} ({})", target_id, addr);
    if let Some(partner_id) = server.connections.remove(&target_id).await {
        // 通知配对方断开
        let break_msg = serde_json::to_string(&WsMessage {
            msg_type: MessageType::Str("break".into()),
            client_id: partner_id.clone(),
            target_id: target_id.clone(),
            message: ErrorCode::PartnerDisconnected.as_str().to_string(),
        })
        .unwrap();
        let _ = server.connections.send_to(&partner_id, &break_msg).await;
        // 通知前端
        let _ = server.event_tx.send(ServerEvent::StatusChanged(
            partner_id,
            ConnectionStatus::WaitingForApp,
        ));
    }
}
