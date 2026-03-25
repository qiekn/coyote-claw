# Coyote Claw 郊狼爪爪

> DG-LAB Coyote 3.0 第三方控制器

[![Release](https://img.shields.io/github/v/release/qiekn/coyote-claw?style=flat-square)](https://github.com/qiekn/coyote-claw/releases)
[![License](https://img.shields.io/github/license/qiekn/coyote-claw?style=flat-square)](LICENSE)

Coyote Claw 是一个开源的 [DG-LAB](https://www.dungeon-lab.com/) 郊狼 3.0 电刺激设备第三方控制器，基于 Tauri v2 构建，内嵌 WebSocket 服务器，无需额外部署后端。

## 工作原理

```
┌─────────────────────────────────┐
│  Coyote Claw (Tauri v2)        │
│  ┌───────────┐ ┌─────────────┐ │         ┌──────────────┐         ┌────────────┐
│  │ React UI  │ │ Rust WS     │ │   WS    │  DG-LAB APP  │   BLE   │ Coyote 3.0 │
│  │           │ │ Server      │←┼────────→│  (手机)       │←───────→│ (设备)      │
│  └───────────┘ └─────────────┘ │         └──────────────┘         └────────────┘
└─────────────────────────────────┘
```

1. 打开 Coyote Claw，自动启动本地 WebSocket 服务器 (端口 9999)
2. 用 DG-LAB 官方 APP 扫描界面上的二维码
3. APP 通过 WebSocket 连接到本地服务器，完成配对
4. 在 Coyote Claw 上控制强度和波形

## 下载

前往 [Releases](https://github.com/qiekn/coyote-claw/releases) 下载最新版本：

| 平台 | 格式 |
|------|------|
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `aarch64.dmg` |
| macOS (Intel) | `x64.dmg` |
| Linux | `.deb` / `.AppImage` |

## 功能

- **二维码配对** — 自动生成 QR code，APP 扫码即连
- **强度控制** — A/B 双通道独立调节 (0-200)
- **波形发送** — 预设波形 (呼吸、潮汐、心跳、持续) 或自定义
- **实时反馈** — APP 回传强度和按钮状态
- **OBS 兼容** — 界面适配 OBS Browser Source 叠加显示

## 技术栈

| 组件 | 技术 |
|------|------|
| 桌面应用 | [Tauri v2](https://v2.tauri.app/) |
| 前端 | React + TypeScript + TailwindCSS v4 |
| WebSocket 服务器 | Rust (tokio-tungstenite) |
| 协议 | DG-LAB Socket v2 |

## 开发

### 环境要求

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+
- [Rust](https://rustup.rs/) (stable)
- 平台依赖:
  - **Windows**: Visual Studio Build Tools (MSVC)
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

### 运行

```bash
pnpm install
pnpm tauri dev
```

> **Windows (MSYS2)**: 需要先设置 MSVC 环境变量，参见 `msvc-env.sh`

### 构建

```bash
pnpm tauri build
```

## 文档

详细的协议文档和开发指南部署在 GitHub Pages: https://qiekn.github.io/coyote-claw/

本地查看文档:

```bash
cd notes
pip install zensical
zensical serve --open
```

## 协议

本项目使用 [GPL-3.0](LICENSE) 许可证。

## 致谢

- [DG-LAB](https://www.dungeon-lab.com/) — 设备制造商及开源协议文档
- [Tauri](https://tauri.app/) — 跨平台桌面应用框架
