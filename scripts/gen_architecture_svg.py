#!/usr/bin/env python3
"""Generate architecture.svg for Coyote Claw documentation."""

svg = """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="'Segoe UI', system-ui, -apple-system, sans-serif">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
    <linearGradient id="tauriGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2a2a4a"/>
      <stop offset="100%" stop-color="#1e1e3a"/>
    </linearGradient>
    <linearGradient id="reactGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a3a5c"/>
      <stop offset="100%" stop-color="#142d4a"/>
    </linearGradient>
    <linearGradient id="rustGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2a1a"/>
      <stop offset="100%" stop-color="#2d2014"/>
    </linearGradient>
    <linearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a3a2a"/>
      <stop offset="100%" stop-color="#142d20"/>
    </linearGradient>
    <linearGradient id="deviceGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a1a3a"/>
      <stop offset="100%" stop-color="#2d142d"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
    </filter>
    <marker id="arrowRight" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#7f8fa6"/>
    </marker>
    <marker id="arrowLeft" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <path d="M8,0 L0,3 L8,6" fill="#7f8fa6"/>
    </marker>
    <marker id="arrowRightCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#00d2d3"/>
    </marker>
    <marker id="arrowLeftCyan" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <path d="M8,0 L0,3 L8,6" fill="#00d2d3"/>
    </marker>
    <marker id="arrowRightPurple" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#a29bfe"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="960" height="420" fill="url(#bgGrad)" rx="12"/>

  <!-- Title -->
  <text x="480" y="38" text-anchor="middle" fill="#e2e8f0" font-size="18" font-weight="600">Coyote Claw Architecture</text>
  <text x="480" y="56" text-anchor="middle" fill="#64748b" font-size="11">Phase 1 \u2014 Local Mode (WS Server embedded in Tauri App)</text>

  <!-- ==================== Tauri App Container ==================== -->
  <rect x="40" y="76" width="440" height="296" rx="10" fill="url(#tauriGrad)" stroke="#4a4a6a" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="60" y="100" fill="#f5c542" font-size="13" font-weight="600">Coyote Claw (Tauri v2)</text>

  <!-- React UI Box -->
  <rect x="64" y="118" width="186" height="230" rx="8" fill="url(#reactGrad)" stroke="#61dafb" stroke-width="1" stroke-opacity="0.6"/>
  <circle cx="84" cy="140" r="8" fill="none" stroke="#61dafb" stroke-width="1.5"/>
  <ellipse cx="84" cy="140" rx="12" ry="4" fill="none" stroke="#61dafb" stroke-width="1" transform="rotate(60,84,140)"/>
  <ellipse cx="84" cy="140" rx="12" ry="4" fill="none" stroke="#61dafb" stroke-width="1" transform="rotate(-60,84,140)"/>
  <text x="100" y="144" fill="#61dafb" font-size="12" font-weight="600">React UI</text>

  <!-- React UI internal items -->
  <rect x="78" y="160" width="158" height="28" rx="4" fill="#1e3a5c" stroke="#3b82f6" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="157" y="178" text-anchor="middle" fill="#93c5fd" font-size="10">ConnectionPanel</text>

  <rect x="78" y="196" width="158" height="28" rx="4" fill="#1e3a5c" stroke="#3b82f6" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="157" y="214" text-anchor="middle" fill="#93c5fd" font-size="10">StrengthPanel</text>

  <rect x="78" y="232" width="158" height="28" rx="4" fill="#1e3a5c" stroke="#3b82f6" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="157" y="250" text-anchor="middle" fill="#93c5fd" font-size="10">WaveformPanel</text>

  <rect x="78" y="268" width="158" height="28" rx="4" fill="#1e3a5c" stroke="#f59e0b" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="157" y="286" text-anchor="middle" fill="#fbbf24" font-size="10">OBS Overlay Mode</text>

  <rect x="78" y="306" width="158" height="28" rx="4" fill="#1e3a5c" stroke="#3b82f6" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="157" y="324" text-anchor="middle" fill="#93c5fd" font-size="10">useWsServer Hook</text>

  <!-- Rust WS Server Box -->
  <rect x="276" y="118" width="186" height="230" rx="8" fill="url(#rustGrad)" stroke="#f77f00" stroke-width="1" stroke-opacity="0.6"/>
  <text x="296" y="144" fill="#f77f00" font-size="12" font-weight="600">\u2699 Rust WS Server</text>

  <!-- Rust internal items -->
  <rect x="290" y="160" width="158" height="28" rx="4" fill="#2d2014" stroke="#f77f00" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="369" y="178" text-anchor="middle" fill="#fbbf24" font-size="10">server.rs (TCP Listener)</text>

  <rect x="290" y="196" width="158" height="28" rx="4" fill="#2d2014" stroke="#f77f00" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="369" y="214" text-anchor="middle" fill="#fbbf24" font-size="10">connection.rs (Registry)</text>

  <rect x="290" y="232" width="158" height="28" rx="4" fill="#2d2014" stroke="#f77f00" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="369" y="250" text-anchor="middle" fill="#fbbf24" font-size="10">message.rs (Routing)</text>

  <rect x="290" y="268" width="158" height="28" rx="4" fill="#2d2014" stroke="#f77f00" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="369" y="286" text-anchor="middle" fill="#fbbf24" font-size="10">protocol.rs (DG-LAB)</text>

  <rect x="290" y="306" width="158" height="28" rx="4" fill="#2d2014" stroke="#f77f00" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="369" y="324" text-anchor="middle" fill="#fbbf24" font-size="10">Port 9999 (0.0.0.0)</text>

  <!-- Arrow: React <-> Rust (Tauri Commands/Events) -->
  <line x1="250" y1="210" x2="276" y2="210" stroke="#7f8fa6" stroke-width="1.5" marker-end="url(#arrowRight)" marker-start="url(#arrowLeft)"/>
  <text x="263" y="200" text-anchor="middle" fill="#94a3b8" font-size="8" transform="rotate(-90,263,200)">Tauri IPC</text>

  <!-- ==================== DG-LAB APP (Phone) ==================== -->
  <rect x="560" y="106" width="170" height="210" rx="16" fill="url(#phoneGrad)" stroke="#10b981" stroke-width="1.5" filter="url(#shadow)"/>
  <!-- Phone notch -->
  <rect x="610" y="106" width="70" height="6" rx="3" fill="#142d20"/>
  <text x="645" y="142" text-anchor="middle" fill="#10b981" font-size="13" font-weight="600">DG-LAB APP</text>
  <text x="645" y="160" text-anchor="middle" fill="#6ee7b7" font-size="10">(Phone / Target)</text>

  <rect x="578" y="176" width="134" height="24" rx="4" fill="#1a3a2a" stroke="#10b981" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="645" y="192" text-anchor="middle" fill="#6ee7b7" font-size="10">SOCKET Control</text>

  <rect x="578" y="208" width="134" height="24" rx="4" fill="#1a3a2a" stroke="#10b981" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="645" y="224" text-anchor="middle" fill="#6ee7b7" font-size="10">QR Scanner</text>

  <rect x="578" y="240" width="134" height="24" rx="4" fill="#1a3a2a" stroke="#10b981" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="645" y="256" text-anchor="middle" fill="#6ee7b7" font-size="10">BLE Connection</text>

  <rect x="578" y="272" width="134" height="24" rx="4" fill="#1a3a2a" stroke="#10b981" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="645" y="288" text-anchor="middle" fill="#6ee7b7" font-size="10">Strength Feedback</text>

  <!-- ==================== Coyote 3.0 Device ==================== -->
  <rect x="800" y="146" width="130" height="130" rx="12" fill="url(#deviceGrad)" stroke="#a855f7" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="865" y="186" text-anchor="middle" fill="#a855f7" font-size="13" font-weight="600">Coyote 3.0</text>
  <text x="865" y="204" text-anchor="middle" fill="#c4b5fd" font-size="10">(Device)</text>

  <rect x="816" y="218" width="98" height="20" rx="4" fill="#2d142d" stroke="#a855f7" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="865" y="232" text-anchor="middle" fill="#c4b5fd" font-size="9">CH-A (0-200)</text>

  <rect x="816" y="244" width="98" height="20" rx="4" fill="#2d142d" stroke="#a855f7" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="865" y="258" text-anchor="middle" fill="#c4b5fd" font-size="9">CH-B (0-200)</text>

  <!-- ==================== Connection Arrows ==================== -->

  <!-- WS Arrow: Rust Server <-> DG-LAB APP -->
  <line x1="480" y1="208" x2="556" y2="208" stroke="#00d2d3" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arrowRightCyan)" marker-start="url(#arrowLeftCyan)" filter="url(#glow)"/>
  <rect x="490" y="188" width="56" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="518" y="200" text-anchor="middle" fill="#00d2d3" font-size="9" font-weight="500">WebSocket</text>

  <!-- Label below WS arrow -->
  <text x="518" y="228" text-anchor="middle" fill="#64748b" font-size="8">JSON messages</text>

  <!-- BLE Arrow: APP <-> Device -->
  <line x1="730" y1="210" x2="796" y2="210" stroke="#a29bfe" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arrowRightPurple)" filter="url(#glow)"/>
  <rect x="734" y="190" width="56" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="762" y="202" text-anchor="middle" fill="#a29bfe" font-size="9" font-weight="500">Bluetooth</text>
  <text x="762" y="228" text-anchor="middle" fill="#64748b" font-size="8">BLE V3 Protocol</text>

  <!-- ==================== Future: UE / External ==================== -->
  <rect x="560" y="346" width="170" height="52" rx="8" fill="#1a1a2e" stroke="#475569" stroke-width="1" stroke-dasharray="4,3" filter="url(#shadow)"/>
  <text x="645" y="370" text-anchor="middle" fill="#64748b" font-size="11">UE / External Clients</text>
  <text x="645" y="386" text-anchor="middle" fill="#475569" font-size="9">(Future)</text>

  <!-- Dashed arrow from Rust server down to Future -->
  <line x1="460" y1="350" x2="556" y2="370" stroke="#475569" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#arrowRight)"/>
  <text x="496" y="350" text-anchor="middle" fill="#475569" font-size="8">WebSocket API</text>

  <!-- ==================== Legend ==================== -->
  <rect x="40" y="384" width="440" height="24" rx="4" fill="#1a1a2e" fill-opacity="0.6"/>
  <line x1="56" y1="396" x2="80" y2="396" stroke="#00d2d3" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="86" y="400" fill="#94a3b8" font-size="9">WebSocket</text>
  <line x1="156" y1="396" x2="180" y2="396" stroke="#a29bfe" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="186" y="400" fill="#94a3b8" font-size="9">Bluetooth LE</text>
  <line x1="270" y1="396" x2="294" y2="396" stroke="#475569" stroke-width="1.2" stroke-dasharray="4,4"/>
  <text x="300" y="400" fill="#94a3b8" font-size="9">Future</text>
  <line x1="356" y1="396" x2="380" y2="396" stroke="#7f8fa6" stroke-width="1.5"/>
  <text x="386" y="400" fill="#94a3b8" font-size="9">Tauri IPC</text>
</svg>"""

output_path = "C:/msys64/home/user/projects/coyote-claw/notes/docs/images/architecture.svg"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(svg)
print(f"Written: {output_path}")
