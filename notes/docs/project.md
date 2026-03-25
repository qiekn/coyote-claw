# WebSocket 架构

## 名词解释

| 名称 | 代称 | 描述 |
| :- | :- | :- |
| 第三方控制器 | `client` | Coyote Claw 桌面应用 |
| WebSocket 服务器 | `server` | 内嵌在 Tauri 中的 Rust WS 服务器 |
| 郊狼手机软件 | `target` | DG-LAB 官方 iOS/Android APP |
| 郊狼设备 | `device` | Coyote 3.0 主机硬件 |

## 连接流程

![协议流程](images/protocol-flow.svg)

![连接时序图 (手绘)](images/protocol-flow-handdrawn.png)

### 步骤详解

**1. 启动服务器**

Coyote Claw 启动时，Rust 后端在 `0.0.0.0:9999` 启动 WebSocket 服务器，并生成一个 UUID v4 作为 `clientId`。

**2. 生成二维码**

二维码内容格式:

```
https://www.dungeon-lab.com/app-download.php#DGLAB-SOCKET#ws://192.168.x.x:9999/CLIENT_ID
```

| 部分 | 说明 |
| :- | :- |
| `dungeon-lab.com/app-download.php` | 官方 APP 下载地址 (兜底) |
| `#DGLAB-SOCKET#` | 协议标识符 |
| `ws://192.168.x.x:9999` | 本机局域网 IP + 端口 |
| `/CLIENT_ID` | 控制器的 UUID |

**3. APP 扫码连接**

APP 扫描二维码后，提取 WebSocket 地址并发起连接。

**4. 服务器分配 targetId**

服务器收到新连接后:

- 生成新的 UUID 作为 `targetId`
- 发送初始 bind 消息: `{"type":"bind","clientId":"APP_ID","targetId":"","message":"targetId"}`

**5. APP 发送绑定请求**

APP 回复: `{"type":"bind","clientId":"...","targetId":"...","message":"DGLAB"}`

**6. 配对完成**

服务器确认后回复 `"200"`: `{"type":"bind","clientId":"...","targetId":"...","message":"200"}`

## 消息格式

所有 WebSocket 消息均为 JSON:

```json
{
  "type": "xxx",
  "clientId": "uuid-v4",
  "targetId": "uuid-v4",
  "message": "xxx"
}
```

- 最大长度: 1950 字符
- ID 格式: UUID v4

## 消息类型

### 控制器 → APP (经服务器转发)

| 操作 | message 格式 | 说明 |
| :- | :- | :- |
| 强度减 | `strength-{ch}+0+{val}` | ch: 1=A, 2=B |
| 强度加 | `strength-{ch}+1+{val}` | val: 变化量 |
| 强度设置 | `strength-{ch}+2+{val}` | val: 0-200 |
| 发送波形 | `pulse-{ch}:[hex_data]` | ch: A 或 B |
| 清空波形 | `clear-{ch}` | ch: 1=A, 2=B |

### APP → 控制器

| 操作 | message 格式 | 说明 |
| :- | :- | :- |
| 强度反馈 | `strength-{a}+{b}+{aLim}+{bLim}` | 4 个 0-200 值 |
| 按钮反馈 | `feedback-{index}` | 0-4: A 通道, 5-9: B 通道 |

### 系统消息

| 类型 | 说明 |
| :- | :- |
| `bind` | 配对消息 |
| `break` | 断开通知 (code: 209) |
| `heartbeat` | 心跳 (60s 间隔) |
| `error` | 错误消息 |

## 错误码

| Code | 说明 |
| :- | :- |
| 200 | 成功 |
| 209 | 对方断开连接 |
| 400 | ID 已被其他客户端绑定 |
| 401 | 目标客户端不存在 |
| 402 | 双方未配对 |
| 403 | 消息不是有效 JSON |
| 404 | 接收方不在线 |
| 405 | 消息超过 1950 字符 |
