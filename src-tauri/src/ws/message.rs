use log::{info, warn};

use crate::ws::connection::ConnectionManager;
use crate::ws::protocol::{
    ErrorCode, MessageType, StrengthRequest, WaveformRequest, WsMessage, MAX_MESSAGE_LEN,
};

/// 处理来自 WebSocket 客户端的原始消息
pub async fn handle_message(
    sender_id: &str,
    raw: &str,
    connections: &ConnectionManager,
    event_tx: &tokio::sync::mpsc::UnboundedSender<ServerEvent>,
) {
    if raw.len() > MAX_MESSAGE_LEN {
        send_error(sender_id, connections, ErrorCode::MessageTooLong).await;
        return;
    }

    // 尝试解析为通用消息
    let msg: WsMessage = match serde_json::from_str(raw) {
        Ok(m) => m,
        Err(_) => {
            send_error(sender_id, connections, ErrorCode::InvalidJson).await;
            return;
        }
    };

    match &msg.msg_type {
        // bind 请求 (来自 APP/target)
        MessageType::Str(s) if s == "bind" => {
            handle_bind(&msg, connections, event_tx).await;
        }
        // clientMsg: 波形数据
        MessageType::Str(s) if s == "clientMsg" => {
            handle_waveform(raw, sender_id, connections).await;
        }
        // msg: APP → Controller 转发
        MessageType::Str(s) if s == "msg" => {
            handle_app_msg(&msg, connections, event_tx).await;
        }
        // heartbeat
        MessageType::Str(s) if s == "heartbeat" => {
            // 心跳回复
            let reply = serde_json::to_string(&WsMessage {
                msg_type: MessageType::Str("heartbeat".into()),
                client_id: msg.client_id.clone(),
                target_id: msg.target_id.clone(),
                message: "200".into(),
            })
            .unwrap();
            let _ = connections.send_to(sender_id, &reply).await;
        }
        // type 1/2/3: 强度控制
        MessageType::Num(n) if *n >= 1 && *n <= 3 => {
            handle_strength(raw, sender_id, connections).await;
        }
        // type 4: 直接转发
        MessageType::Num(4) => {
            handle_direct_forward(&msg, sender_id, connections).await;
        }
        _ => {
            warn!("Unknown message type from {}: {:?}", sender_id, msg.msg_type);
        }
    }
}

/// 处理 bind 请求
async fn handle_bind(
    msg: &WsMessage,
    connections: &ConnectionManager,
    event_tx: &tokio::sync::mpsc::UnboundedSender<ServerEvent>,
) {
    let client_id = &msg.client_id;
    let target_id = &msg.target_id;

    // 验证 clientId 存在
    if !connections.exists(client_id).await {
        if !target_id.is_empty() {
            let _ = send_bind_response(target_id, client_id, target_id, ErrorCode::TargetNotExist, connections).await;
        }
        return;
    }

    match connections.bind(client_id, target_id).await {
        Ok(()) => {
            info!("Paired: client={} target={}", client_id, target_id);
            // 通知双方配对成功
            let _ = send_bind_response(client_id, client_id, target_id, ErrorCode::Success, connections).await;
            let _ = send_bind_response(target_id, client_id, target_id, ErrorCode::Success, connections).await;
            // 通知前端
            let _ = event_tx.send(ServerEvent::StatusChanged(
                client_id.to_string(),
                crate::ws::protocol::ConnectionStatus::Paired,
            ));
        }
        Err(e) => {
            warn!("Bind failed: {}", e);
            let code = if e.contains("already bound") {
                ErrorCode::AlreadyBound
            } else {
                ErrorCode::TargetNotExist
            };
            if !target_id.is_empty() {
                let _ = send_bind_response(target_id, client_id, target_id, code, connections).await;
            }
        }
    }
}

/// 处理强度控制 (type 1/2/3)
async fn handle_strength(
    raw: &str,
    sender_id: &str,
    connections: &ConnectionManager,
) {
    let req: StrengthRequest = match serde_json::from_str(raw) {
        Ok(r) => r,
        Err(_) => {
            send_error(sender_id, connections, ErrorCode::InvalidJson).await;
            return;
        }
    };

    // 转换为 strength 消息格式
    let (mode, value) = match req.msg_type {
        1 => (0, 1), // decrease by 1
        2 => (1, 1), // increase by 1
        3 => (2, req.strength.min(200)), // set absolute
        _ => return,
    };

    let strength_msg = format!("strength-{}+{}+{}", req.channel, mode, value);

    let forward = serde_json::to_string(&WsMessage {
        msg_type: MessageType::Str("msg".into()),
        client_id: req.client_id.clone(),
        target_id: req.target_id.clone(),
        message: strength_msg,
    })
    .unwrap();

    // 转发到 target (APP)
    if let Some(partner) = connections.get_partner(sender_id).await {
        let _ = connections.send_to(&partner, &forward).await;
    } else {
        send_error(sender_id, connections, ErrorCode::NotPaired).await;
    }
}

/// 处理波形数据 (type "clientMsg")
async fn handle_waveform(
    raw: &str,
    sender_id: &str,
    connections: &ConnectionManager,
) {
    let req: WaveformRequest = match serde_json::from_str(raw) {
        Ok(r) => r,
        Err(_) => {
            send_error(sender_id, connections, ErrorCode::InvalidJson).await;
            return;
        }
    };

    // 构造 pulse 消息: "pulse-{channel}:{waveform_data}"
    let pulse_msg = format!("pulse-{}:{}", req.channel, req.message);

    let forward = serde_json::to_string(&WsMessage {
        msg_type: MessageType::Str("msg".into()),
        client_id: req.client_id.clone(),
        target_id: req.target_id.clone(),
        message: pulse_msg,
    })
    .unwrap();

    if let Some(partner) = connections.get_partner(sender_id).await {
        let _ = connections.send_to(&partner, &forward).await;
    } else {
        send_error(sender_id, connections, ErrorCode::NotPaired).await;
    }
}

/// 处理 APP 发来的消息转发给 Controller
async fn handle_app_msg(
    msg: &WsMessage,
    connections: &ConnectionManager,
    event_tx: &tokio::sync::mpsc::UnboundedSender<ServerEvent>,
) {
    let sender_id = &msg.target_id; // APP 是 target
    let partner_id = &msg.client_id;

    // 检查是否是强度反馈
    if msg.message.starts_with("strength-") {
        if let Some(fb) = crate::ws::protocol::StrengthFeedback::parse(&msg.message) {
            let _ = event_tx.send(ServerEvent::StrengthUpdate(fb));
        }
    }
    // 检查是否是按钮反馈
    else if msg.message.starts_with("feedback-") {
        let _ = event_tx.send(ServerEvent::Feedback(msg.message.clone()));
    }

    // 转发给 Controller
    let forward = serde_json::to_string(msg).unwrap();
    if connections.exists(partner_id).await {
        let _ = connections.send_to(partner_id, &forward).await;
    } else {
        send_error(sender_id, connections, ErrorCode::RecipientOffline).await;
    }
}

/// 处理直接转发 (type 4)
async fn handle_direct_forward(
    msg: &WsMessage,
    sender_id: &str,
    connections: &ConnectionManager,
) {
    let forward = serde_json::to_string(&WsMessage {
        msg_type: MessageType::Str("msg".into()),
        client_id: msg.client_id.clone(),
        target_id: msg.target_id.clone(),
        message: msg.message.clone(),
    })
    .unwrap();

    if let Some(partner) = connections.get_partner(sender_id).await {
        let _ = connections.send_to(&partner, &forward).await;
    } else {
        send_error(sender_id, connections, ErrorCode::NotPaired).await;
    }
}

/// 发送 bind 响应
async fn send_bind_response(
    to: &str,
    client_id: &str,
    target_id: &str,
    code: ErrorCode,
    connections: &ConnectionManager,
) -> Result<(), &'static str> {
    let msg = serde_json::to_string(&WsMessage {
        msg_type: MessageType::Str("bind".into()),
        client_id: client_id.to_string(),
        target_id: target_id.to_string(),
        message: code.as_str().to_string(),
    })
    .unwrap();
    connections.send_to(to, &msg).await
}

/// 发送错误消息
async fn send_error(to: &str, connections: &ConnectionManager, code: ErrorCode) {
    let msg = serde_json::to_string(&WsMessage {
        msg_type: MessageType::Str("error".into()),
        client_id: String::new(),
        target_id: String::new(),
        message: code.as_str().to_string(),
    })
    .unwrap();
    let _ = connections.send_to(to, &msg).await;
}

// --- Server Events (发送给 Tauri 前端) ---

#[derive(Debug, Clone)]
pub enum ServerEvent {
    StatusChanged(String, crate::ws::protocol::ConnectionStatus),
    StrengthUpdate(crate::ws::protocol::StrengthFeedback),
    Feedback(String),
}
