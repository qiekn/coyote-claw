# Coyote Claw - DG-LAB Coyote 3.0 Controller

## Project Overview

Coyote Claw (郊狼爪爪) is a third-party controller for the DG-LAB Coyote 3.0 e-stim device.

### Architecture

```
┌──────────────────┐     WebSocket      ┌──────────────────┐    Bluetooth     ┌──────────────────┐
│  Coyote Claw     │  ←──────────────→  │  DG-LAB APP      │  ←───────────→   │  Coyote 3.0      │
│  (Controller)    │    JSON messages    │  (Bridge)        │    BLE / B0 cmd  │  (Device)        │
└──────────────────┘                    └──────────────────┘                  └──────────────────┘
        │
        │  Future: WebSocket API
        ▼
┌──────────────────┐
│  Unreal Engine   │
│  (Game Plugin)   │
└──────────────────┘
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
| Frontend       | React + TypeScript    |
| WS Server      | Rust (self-hosted)    |
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
