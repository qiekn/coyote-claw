---
name: dg-lab-websocket-protocol
description: DG-LAB WebSocket Socket v2 protocol reference - message format, connection flow, strength/waveform commands, error codes
---

# DG-LAB WebSocket Protocol (Socket v2)

## Overview

The WebSocket protocol enables third-party controllers to communicate with the DG-LAB APP,
which then relays commands to the Coyote 3.0 device via Bluetooth.

## Connection Flow

```
1. Controller connects to WS server → server assigns clientId
2. Controller generates QR code (contains WS address + clientId)
3. DG-LAB APP scans QR code → connects to WS server → server assigns targetId
4. APP sends bind request (clientId + targetId)
5. Server establishes pairing → sends "200" to both sides
6. Pairing complete, bidirectional communication begins
```

## QR Code Format

```
https://www.dungeon-lab.com/app-download.php#DGLAB-SOCKET#ws://SERVER_ADDRESS:PORT/CLIENT_ID
```

Rules:
- Must contain exactly TWO `#` separators
- No extra path segments between server address and client ID
- Use `wss://` for production, `ws://` for local development

## Message Format

All messages are JSON with these required fields:

```json
{ "type": "xxx", "clientId": "xxx", "targetId": "xxx", "message": "xxx" }
```

- Max message length: 1950 characters (APP will discard longer messages)
- IDs must be UUID v4

## Message Types

### Controller → Server

#### Strength Decrease (type: 1)
```json
{ "type": 1, "channel": 1, "message": "set channel", "clientId": "xxx", "targetId": "xxx" }
```
- channel: 1 = A, 2 = B
- Server converts to: `strength-{channel}+0+1`

#### Strength Increase (type: 2)
```json
{ "type": 2, "channel": 1, "message": "set channel", "clientId": "xxx", "targetId": "xxx" }
```
- Server converts to: `strength-{channel}+1+1`

#### Strength Set (type: 3)
```json
{ "type": 3, "channel": 2, "strength": 35, "message": "set channel", "clientId": "xxx", "targetId": "xxx" }
```
- strength: 0-200
- Server converts to: `strength-{channel}+2+{value}`

#### Direct Forward (type: 4)
```json
{ "type": 4, "message": "clear-1", "clientId": "xxx", "targetId": "xxx" }
```
- message content forwarded directly as APP command

#### Send Waveform (type: "clientMsg")
```json
{ "type": "clientMsg", "channel": "A", "time": 5, "message": "A:[\"0A0A0A0A64646464\",...]", "clientId": "xxx", "targetId": "xxx" }
```
- channel: "A" or "B"
- time: duration in seconds (default 5)
- Server adds `pulse-` prefix and sends at configured rate

### Server → APP

All messages use `type: "msg"`.

#### Strength Command
`message`: `strength-{channel}+{mode}+{value}`
- channel: 1=A, 2=B
- mode: 0=decrease, 1=increase, 2=set absolute
- value: 0-200

#### Waveform Command
`message`: `pulse-{channel}:["HEX_DATA",...]`
- channel: A or B
- Max 100 entries per message (10 seconds), APP queue max 500 (50 seconds)

#### Clear Waveform Queue
`message`: `clear-{channel}` (channel: 1=A, 2=B)

### APP → Server → Controller

#### Strength Feedback
`message`: `strength-{A_strength}+{B_strength}+{A_limit}+{B_limit}`
- All values 0-200

#### Feedback Button
`message`: `feedback-{index}`
- index 0-4: A channel buttons
- index 5-9: B channel buttons

### Server → Controller

#### Bind Messages
- Initial: `{ "type": "bind", "clientId": "uuid", "targetId": "", "message": "targetId" }`
- Success: `{ "type": "bind", ..., "message": "200" }`
- Failure: `{ "type": "bind", ..., "message": "400" }`

#### Disconnect: `{ "type": "break", ..., "message": "209" }`
#### Error: `{ "type": "error", ..., "message": "{code}" }`
#### Heartbeat: `{ "type": "heartbeat", ..., "message": "200" }` (default every 60s)

## Error Codes

| Code | Description                        |
|------|------------------------------------|
| 200  | Success                            |
| 209  | Partner disconnected               |
| 210  | No valid clientID in QR code       |
| 211  | Connected but no APP ID assigned   |
| 400  | ID already bound by another client |
| 401  | Target client does not exist       |
| 402  | Sender and receiver not paired     |
| 403  | Message is not valid JSON          |
| 404  | Recipient not found (offline)      |
| 405  | Message length exceeds 1950        |
| 406  | Missing channel field              |
| 500  | Server internal error              |
