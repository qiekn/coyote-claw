use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};

use crate::ws::protocol::ConnectionStatus;

/// 一个 WebSocket 连接
#[derive(Debug)]
pub struct Connection {
    pub id: String,
    pub role: Role,
    pub paired_with: Option<String>,
    pub tx: mpsc::UnboundedSender<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Role {
    Client,
    Target,
}

/// 连接管理器 — 管理所有活跃连接和配对关系
#[derive(Debug, Clone)]
pub struct ConnectionManager {
    inner: Arc<RwLock<Inner>>,
}

#[derive(Debug)]
struct Inner {
    connections: HashMap<String, Connection>,
}

impl ConnectionManager {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(Inner {
                connections: HashMap::new(),
            })),
        }
    }

    /// 注册新连接
    pub async fn register(
        &self,
        id: String,
        role: Role,
        tx: mpsc::UnboundedSender<String>,
    ) {
        let conn = Connection {
            id: id.clone(),
            role,
            paired_with: None,
            tx,
        };
        self.inner.write().await.connections.insert(id, conn);
    }

    /// 移除连接并返回配对方 ID
    pub async fn remove(&self, id: &str) -> Option<String> {
        let mut inner = self.inner.write().await;
        if let Some(conn) = inner.connections.remove(id) {
            if let Some(ref partner_id) = conn.paired_with {
                // 清除配对方的配对关系
                if let Some(partner) = inner.connections.get_mut(partner_id) {
                    partner.paired_with = None;
                }
                return Some(partner_id.clone());
            }
        }
        None
    }

    /// 配对两个连接
    pub async fn bind(&self, client_id: &str, target_id: &str) -> Result<(), &'static str> {
        let mut inner = self.inner.write().await;

        let client = inner
            .connections
            .get(client_id)
            .ok_or("client not found")?;
        if client.paired_with.is_some() {
            return Err("client already bound");
        }

        let target = inner
            .connections
            .get(target_id)
            .ok_or("target not found")?;
        if target.paired_with.is_some() {
            return Err("target already bound");
        }

        // 建立双向配对
        inner
            .connections
            .get_mut(client_id)
            .unwrap()
            .paired_with = Some(target_id.to_string());
        inner
            .connections
            .get_mut(target_id)
            .unwrap()
            .paired_with = Some(client_id.to_string());

        Ok(())
    }

    /// 发送消息到指定连接
    pub async fn send_to(&self, id: &str, msg: &str) -> Result<(), &'static str> {
        let inner = self.inner.read().await;
        let conn = inner.connections.get(id).ok_or("connection not found")?;
        conn.tx.send(msg.to_string()).map_err(|_| "send failed")
    }

    /// 获取配对方 ID
    pub async fn get_partner(&self, id: &str) -> Option<String> {
        let inner = self.inner.read().await;
        inner
            .connections
            .get(id)
            .and_then(|c| c.paired_with.clone())
    }

    /// 检查连接是否存在
    pub async fn exists(&self, id: &str) -> bool {
        self.inner.read().await.connections.contains_key(id)
    }

    /// 获取连接状态 (针对 clientId)
    pub async fn get_status(&self, client_id: &str) -> ConnectionStatus {
        let inner = self.inner.read().await;
        match inner.connections.get(client_id) {
            None => ConnectionStatus::Disconnected,
            Some(conn) => {
                if conn.paired_with.is_some() {
                    ConnectionStatus::Paired
                } else {
                    ConnectionStatus::WaitingForApp
                }
            }
        }
    }
}
