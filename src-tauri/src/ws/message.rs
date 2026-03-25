use log::{info, warn};

use crate::ws::protocol::{
    ConnectionStatus, MessageType, StrengthFeedback, WsMessage,
};
use crate::ws::server::WsServer;

/// 处理来自 APP 的消息 (对标 C++ TUI 的 OnMessage)
pub async fn handle_message(server: &WsServer, _app_id: &str, raw: &str) {
    let msg: WsMessage = match serde_json::from_str(raw) {
        Ok(m) => m,
        Err(e) => {
            warn!("JSON parse error: {} raw={}", e, raw);
            return;
        }
    };

    match &msg.msg_type {
        // APP 发来 bind 请求: message == "DGLAB" 表示绑定
        MessageType::Str(s) if s == "bind" => {
            if msg.message == "DGLAB" {
                info!("Bind success (APP: {})", msg.client_id);
                server.set_status(ConnectionStatus::Paired).await;

                // 回复 200
                let resp = serde_json::to_string(&WsMessage {
                    msg_type: MessageType::Str("bind".into()),
                    client_id: msg.client_id.clone(),
                    target_id: msg.target_id.clone(),
                    message: "200".into(),
                })
                .unwrap();
                let _ = server.send_to_app(&resp).await;
            }
        }
        // APP 转发的消息 (强度反馈等)
        MessageType::Str(s) if s == "msg" => {
            // 强度反馈: "strength-{a}+{b}+{aLimit}+{bLimit}"
            if let Some(fb) = StrengthFeedback::parse(&msg.message) {
                let _ = server.event_tx.send(ServerEvent::StrengthUpdate(fb));
            }
            // 按钮反馈: "feedback-{index}"
            else if msg.message.starts_with("feedback-") {
                let _ = server
                    .event_tx
                    .send(ServerEvent::Feedback(msg.message.clone()));
            } else {
                info!("Recv from APP: {}", msg.message);
            }
        }
        // 心跳
        MessageType::Str(s) if s == "heartbeat" => {
            // acknowledged, no action needed
        }
        _ => {
            warn!(
                "Unknown type: {:?} msg: {}",
                msg.msg_type, msg.message
            );
        }
    }
}

// --- Server Events (发送给 Tauri 前端) ---

#[derive(Debug, Clone)]
pub enum ServerEvent {
    StatusChanged(ConnectionStatus),
    StrengthUpdate(StrengthFeedback),
    Feedback(String),
}
