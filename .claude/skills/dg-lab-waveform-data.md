# DG-LAB Waveform Data

## Waveform Unit Structure

Each unit = 8-byte HEX string = 100ms of output (4 x 25ms)

```
[FF][FF][FF][FF][II][II][II][II]
 freq  freq  freq  freq  int   int   int   int
 (25ms)(25ms)(25ms)(25ms)(25ms)(25ms)(25ms)(25ms)
```

- Frequency bytes: 10-240 (see V3 protocol for conversion from 10-1000)
- Intensity bytes: 0-100 (percentage)

## WebSocket Waveform Message

```json
{
  "type": "msg",
  "clientId": "xxx",
  "targetId": "xxx",
  "message": "pulse-A:[\"0A0A0A0A64646464\",\"0A0A0A0A32323232\"]"
}
```

- `pulse-A` or `pulse-B` for channel selection
- Array of HEX strings, max 100 per message (10 seconds)
- APP waveform queue max: 500 entries (50 seconds)

## Built-in Waveform Examples (V3 Format)

### Breathing (呼吸)
```
0A0A0A0A00000000  freq=10, strength=0%
0A0A0A0A14141414  freq=10, strength=20%
0A0A0A0A28282828  freq=10, strength=40%
0A0A0A0A3C3C3C3C  freq=10, strength=60%
0A0A0A0A50505050  freq=10, strength=80%
0A0A0A0A64646464  freq=10, strength=100%
0A0A0A0A64646464  freq=10, strength=100%
0A0A0A0A64646464  freq=10, strength=100%
0A0A0A0A00000000  freq=10, strength=0%
0A0A0A0A00000000  freq=10, strength=0%
0A0A0A0A00000000  freq=10, strength=0%
0A0A0A0A00000000  freq=10, strength=0%
```

### Tidal (潮汐)
Dual-cycle pattern with ascending frequency (10→42 Hz) and varying intensity.
Full data in `notes/DG-LAB-OPENSOURCE/coyote/v3/example.md`.

## Waveform Design Tips

- For continuous output: send waveform data slightly faster than playback rate
- To stop a channel: send clear command (`clear-1` for A, `clear-2` for B)
- Official APP waveforms typically use identical values for all 4 periods within each 100ms unit
- Frequency balance parameter (BF command) affects how low/high frequencies feel
- Intensity is relative - actual sensation depends on channel strength setting
