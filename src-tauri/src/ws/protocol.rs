use serde::{Deserialize, Serialize};

// --- WebSocket JSON 消息格式 ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WsMessage {
    #[serde(rename = "type")]
    pub msg_type: MessageType,
    pub client_id: String,
    pub target_id: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MessageType {
    Str(String),
    Num(u32),
}

impl MessageType {
    pub fn as_str(&self) -> Option<&str> {
        match self {
            MessageType::Str(s) => Some(s),
            MessageType::Num(_) => None,
        }
    }

    pub fn as_num(&self) -> Option<u32> {
        match self {
            MessageType::Num(n) => Some(*n),
            MessageType::Str(_) => None,
        }
    }
}

// --- 强度控制请求 (type 1/2/3) ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StrengthRequest {
    #[serde(rename = "type")]
    pub msg_type: u32,
    pub client_id: String,
    pub target_id: String,
    pub message: String,
    pub channel: u32,
    #[serde(default)]
    pub strength: u32,
}

// --- 波形消息 (type "clientMsg") ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WaveformRequest {
    #[serde(rename = "type")]
    pub msg_type: String,
    pub client_id: String,
    pub target_id: String,
    pub message: String,
    pub channel: String,
    #[serde(default = "default_waveform_time")]
    pub time: u32,
}

fn default_waveform_time() -> u32 {
    5
}

// --- 强度反馈 (APP → Controller) ---

#[derive(Debug, Clone)]
pub struct StrengthFeedback {
    pub a_strength: u32,
    pub b_strength: u32,
    pub a_limit: u32,
    pub b_limit: u32,
}

impl StrengthFeedback {
    pub fn parse(msg: &str) -> Option<Self> {
        let parts: Vec<&str> = msg.strip_prefix("strength-")?.split('+').collect();
        if parts.len() != 4 {
            return None;
        }
        Some(StrengthFeedback {
            a_strength: parts[0].parse().ok()?,
            b_strength: parts[1].parse().ok()?,
            a_limit: parts[2].parse().ok()?,
            b_limit: parts[3].parse().ok()?,
        })
    }
}

// --- 错误码 ---

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ErrorCode {
    Success = 200,
    PartnerDisconnected = 209,
    NoClientId = 210,
    NoAppId = 211,
    AlreadyBound = 400,
    TargetNotExist = 401,
    NotPaired = 402,
    InvalidJson = 403,
    RecipientOffline = 404,
    MessageTooLong = 405,
    MissingChannel = 406,
    ServerError = 500,
}

impl ErrorCode {
    pub fn as_str(&self) -> &'static str {
        match self {
            ErrorCode::Success => "200",
            ErrorCode::PartnerDisconnected => "209",
            ErrorCode::NoClientId => "210",
            ErrorCode::NoAppId => "211",
            ErrorCode::AlreadyBound => "400",
            ErrorCode::TargetNotExist => "401",
            ErrorCode::NotPaired => "402",
            ErrorCode::InvalidJson => "403",
            ErrorCode::RecipientOffline => "404",
            ErrorCode::MessageTooLong => "405",
            ErrorCode::MissingChannel => "406",
            ErrorCode::ServerError => "500",
        }
    }
}

// --- 连接状态 (前端用) ---

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ConnectionStatus {
    Disconnected,
    WaitingForApp,
    Paired,
}

// --- 强度控制模式 ---

#[derive(Debug, Clone, Copy)]
pub enum StrengthMode {
    Decrease = 0,
    Increase = 1,
    Set = 2,
}

// --- 通道 ---

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Channel {
    A = 1,
    B = 2,
}

impl Channel {
    pub fn from_num(n: u32) -> Option<Self> {
        match n {
            1 => Some(Channel::A),
            2 => Some(Channel::B),
            _ => None,
        }
    }

    pub fn letter(&self) -> &'static str {
        match self {
            Channel::A => "A",
            Channel::B => "B",
        }
    }
}

/// 最大消息长度
pub const MAX_MESSAGE_LEN: usize = 1950;

/// 心跳间隔 (秒)
pub const HEARTBEAT_INTERVAL_SECS: u64 = 60;
