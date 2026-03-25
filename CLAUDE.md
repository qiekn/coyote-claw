# Coyote Claw - DG-LAB Coyote 3.0 Controller

## Project Overview

Coyote Claw (郊狼爪爪) is a third-party controller for the DG-LAB Coyote 3.0 e-stim device.

### Architecture

Phase 1: Local mode (WS Server embedded in Tauri App)
```
┌─────────────────────────────────────────┐
│  Coyote Claw (Tauri v2)                 │
│  ┌─────────────┐  ┌──────────────────┐  │    Bluetooth     ┌──────────────┐
│  │  React UI   │  │  Embedded Rust   │  │                  │  Coyote 3.0  │
│  │  (Frontend) │  │  WS Server       │←─┼──── WebSocket ──→│  via DG-LAB  │
│  │             │  │  (Tauri Backend)  │  │    JSON messages │  APP (phone) │
│  └─────────────┘  └──────────────────┘  │                  └──────────────┘
│                          │              │
│                   Local WebSocket API   │
│                          │              │
└──────────────────────────┼──────────────┘
                           ▼ (Future)
                   ┌──────────────┐
                   │ UE / External│
                   │ Clients      │
                   └──────────────┘
```

Phase 2: Remote mode (standalone WS Server on VPS)
```
┌──────────────┐           ┌────────────────┐           ┌──────────────┐
│  Coyote Claw │  ──WS──→  │  Rust WS Server│  ←──WS──  │  DG-LAB APP  │
│  (local)     │           │  (VPS)         │           │  (remote)    │
└──────────────┘           └────────────────┘           └──────────────┘
```

### Terminology

| Term      | Description                              |
|-----------|------------------------------------------|
| client    | Third-party controller (us, Coyote Claw) |
| server    | WebSocket bridge (self-hosted, Rust)     |
| target    | DG-LAB APP (phone)                       |
| device    | Coyote 3.0 hardware                     |
| channel   | A or B pulse output channel              |
| strength  | Channel intensity (0-200)                |
| waveform  | Pulse pattern (frequency + intensity)    |

## Tech Stack

| Component      | Technology            |
|----------------|-----------------------|
| Desktop App    | Tauri v2              |
| Frontend       | React + TypeScript + TailwindCSS v4 |
| WS Server      | Rust (tokio-tungstenite, embedded in Tauri + standalone for VPS) |
| Protocol       | DG-LAB Socket v2      |
| Documentation  | Zensical (in /notes)  |
| UE Integration | Deferred (WebSocket API first) |

### OBS Integration

The UI should be designed with OBS overlay compatibility in mind:
- Browser Source friendly (transparent background option)
- Key state info visible at a glance (connection status, channel strength, active waveform)

## Project Structure

```
coyote-claw/
├── CLAUDE.md              # This file
├── README.md
├── LICENSE                # GPLv3
├── package.json           # pnpm + Vite + React
├── vite.config.ts
├── tsconfig.json
├── index.html             # Vite entry
├── msvc-env.sh            # MSVC env for MSYS2 builds
├── src/                   # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css          # TailwindCSS v4
│   ├── components/
│   │   ├── ConnectionPanel.tsx
│   │   ├── StrengthPanel.tsx
│   │   └── WaveformPanel.tsx
│   └── hooks/
│       └── useWsServer.ts
├── src-tauri/             # Rust backend (Tauri v2)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       ├── lib.rs         # Tauri commands & app setup
│       └── ws/            # WebSocket server module
│           ├── mod.rs
│           ├── server.rs      # TCP listener, connection lifecycle
│           ├── connection.rs  # Connection types (legacy, to be removed)
│           ├── message.rs     # Message routing & protocol handling
│           └── protocol.rs    # DG-LAB types & constants
├── notes/                 # Zensical documentation site
│   ├── docs/
│   │   ├── index.md
│   │   ├── json.md        # Waveform JSON protocol
│   │   ├── project.md     # WebSocket architecture
│   │   └── pulse.md       # .pulse waveform file format (WIP)
│   └── DG-LAB-OPENSOURCE/ # Official open-source reference (read-only)
├── .claude/
│   └── skills/            # Claude skills for DG-LAB protocols
└── exts/                  # Extensions (empty)
```

## Key Protocol References

Official open-source docs are in `notes/DG-LAB-OPENSOURCE/`:
- `coyote/v3/README_V3.md` - Bluetooth V3 protocol (B0/BF commands, B1 responses)
- `socket/v2/README.md` - WebSocket Socket v2 protocol (message format, pairing, strength, waveform)
- `coyote/extra/README.md` - Waveform frequency/intensity explanation
- `coyote/v3/example.md` - Built-in waveform data examples

## Development Guidelines

- Language: All user-facing text in Chinese (简体中文), code in English
- Commit messages: Follow `.claude/rules/git-workflow.md`
- PawPrints (传感器配件): Ignore for now, not in scope
- Coyote V2 protocol: Ignore, we only target V3
- Package manager: pnpm
- Build tool: Vite
- MSYS2 UCRT: run `source msvc-env.sh` before `cargo build` if INCLUDE/LIB not set

## Tauri Commands (Frontend → Rust)

| Command | Params | Description |
|---------|--------|-------------|
| `get_qrcode_url` | - | QR code URL for APP pairing |
| `send_strength` | channel, mode, value | Strength control |
| `send_waveform` | channel, waveform | Send waveform data |
| `clear_waveform` | channel | Clear waveform queue |
| `get_connection_status` | - | Current connection status |

## Tauri Events (Rust → Frontend)

| Event | Payload | Description |
|-------|---------|-------------|
| `ws:connection-status` | ConnectionStatus | Status change |
| `ws:strength-update` | {a, b, aLimit, bLimit} | Strength feedback |
| `ws:feedback` | string | APP button feedback |
