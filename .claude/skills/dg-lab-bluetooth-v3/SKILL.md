---
name: dg-lab-bluetooth-v3
description: DG-LAB Coyote V3 Bluetooth Low Energy protocol - B0 command, BF settings, B1 response, waveform encoding
---

# DG-LAB Coyote V3 Bluetooth Protocol

## Overview

The Coyote 3.0 uses Bluetooth Low Energy (BLE) to communicate with the DG-LAB APP.
Our controller does NOT connect to the device directly - the APP acts as a bridge.
This skill documents the underlying protocol for understanding waveform data.

## BLE Characteristics

| Service UUID | Char UUID | Property    | Name        | Max Size |
|:------------:|:---------:|:-----------:|:-----------:|:--------:|
| 0x180C       | 0x150A    | Write       | WRITE       | 20 bytes |
| 0x180C       | 0x150B    | Notify      | NOTIFY      | 20 bytes |
| 0x180A       | 0x1500    | Read/Notify | READ/NOTIFY | 1 byte   |

Base UUID: `0000{xxxx}-0000-1000-8000-00805f9b34fb`

BLE Name: `47L121000` (Coyote 3.0)

## B0 Command (Main Control, every 100ms)

```
0xB0 (1 byte HEAD)
+ sequence_number (4 bits)
+ strength_mode (4 bits)
+ A_channel_strength (1 byte)
+ B_channel_strength (1 byte)
+ A_freq[4] (4 bytes)
+ A_intensity[4] (4 bytes)
+ B_freq[4] (4 bytes)
+ B_intensity[4] (4 bytes)
= 20 bytes total
```

### Sequence Number (4 bits, 0x0-0xF)
- Set >0 to request strength feedback via B1 response
- Set 0 to skip feedback
- When modifying strength with seq>0, wait for B1 response before next modification

### Strength Mode (4 bits)
High 2 bits = A channel, Low 2 bits = B channel:
- 0b00: No change (strength value ignored)
- 0b01: Relative increase
- 0b10: Relative decrease
- 0b11: Absolute set

### Channel Strength (1 byte each)
- Range: 0-200 (values >200 treated as 0)
- Device absolute range: 0-200

### Waveform Frequency (1 byte each, 4 per channel)
- Raw range: 10-240
- Each value represents 25ms of output
- 4 values = 100ms total

Frequency conversion (input range 10-1000 → output 10-240):
```
if input in 10..100:   output = input
if input in 101..600:  output = (input - 100) / 5 + 100
if input in 601..1000: output = (input - 600) / 10 + 200
```

### Waveform Intensity (1 byte each, 4 per channel)
- Range: 0-100
- If ANY value is out of range, ALL 4 values for that channel are discarded
- To disable a channel: set at least one intensity >100 (e.g., 101 = 0x65)

## BF Command (Settings, persistent across power cycles)

```
0xBF (1 byte HEAD)
+ A_soft_limit (1 byte) + B_soft_limit (1 byte)
+ A_freq_balance (1 byte) + B_freq_balance (1 byte)
+ A_intensity_balance (1 byte) + B_intensity_balance (1 byte)
= 7 bytes total
```

**WARNING: BF takes effect immediately with no response. Must re-send after each reconnect.**

- Soft limit: 0-200 (caps max channel strength)
- Freq balance (param 1): 0-255 (higher = stronger low-freq impact)
- Intensity balance (param 2): 0-255 (higher = stronger low-freq stimulation)

## B1 Response (Strength Feedback via NOTIFY 0x150B)

```
0xB1 (1 byte HEAD) + sequence (1 byte) + A_strength (1 byte) + B_strength (1 byte)
```

- Sent when strength changes
- Sequence matches the B0 command that caused the change (0 if caused by hardware wheel)

## Waveform Data Format (for WebSocket)

Each waveform unit is an 8-byte HEX string (16 hex chars):
- First 4 bytes: frequency (10-240 Hz per byte)
- Last 4 bytes: intensity (0-100% per byte)

Example: `0A0A0A0A64646464`
- Freq: 0x0A=10 Hz for all 4 periods
- Intensity: 0x64=100% for all 4 periods

### Disable Channel
Set at least one intensity byte >100:
- `0000000000000065` (last intensity = 0x65 = 101, disables channel)

## Frequency ↔ Pulse Rate

| Wave Freq (ms) | Output Value | Pulse Rate |
|:--------------:|:------------:|:----------:|
| 10             | 10           | 100 Hz     |
| 20             | 20           | 50 Hz      |
| 100            | 100          | 10 Hz      |
| 1000           | 240          | 1 Hz       |

Low freq (0-30 Hz): Impact sensation
High freq (>100 Hz): Tingling sensation
