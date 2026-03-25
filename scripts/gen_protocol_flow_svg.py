#!/usr/bin/env python3
"""Generate protocol-flow.svg - WebSocket connection sequence diagram."""

svg = """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 780" font-family="'Segoe UI', system-ui, -apple-system, sans-serif">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <marker id="arrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#00d2d3"/>
    </marker>
    <marker id="arrowL" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <path d="M8,0 L0,3 L8,6" fill="#10b981"/>
    </marker>
    <marker id="arrowRGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#10b981"/>
    </marker>
    <marker id="arrowROrange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#f59e0b"/>
    </marker>
    <marker id="arrowLOrange" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <path d="M8,0 L0,3 L8,6" fill="#f59e0b"/>
    </marker>
    <marker id="arrowRPurple" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#a29bfe"/>
    </marker>
    <marker id="arrowLPurple" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
      <path d="M8,0 L0,3 L8,6" fill="#a29bfe"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="820" height="780" fill="url(#bgGrad)" rx="12"/>

  <!-- Title -->
  <text x="410" y="36" text-anchor="middle" fill="#e2e8f0" font-size="18" font-weight="600">WebSocket Protocol Flow</text>
  <text x="410" y="54" text-anchor="middle" fill="#64748b" font-size="11">DG-LAB Socket v2 \u2014 Connection, Pairing, and Command Sequence</text>

  <!-- ==================== Actor Headers ==================== -->
  <!-- Controller (Coyote Claw) -->
  <rect x="80" y="72" width="140" height="36" rx="6" fill="#1a3a5c" stroke="#61dafb" stroke-width="1.2" filter="url(#shadow)"/>
  <text x="150" y="95" text-anchor="middle" fill="#61dafb" font-size="12" font-weight="600">Controller</text>

  <!-- WS Server -->
  <rect x="340" y="72" width="140" height="36" rx="6" fill="#2d2014" stroke="#f77f00" stroke-width="1.2" filter="url(#shadow)"/>
  <text x="410" y="95" text-anchor="middle" fill="#f77f00" font-size="12" font-weight="600">WS Server</text>

  <!-- APP (Target) -->
  <rect x="600" y="72" width="140" height="36" rx="6" fill="#1a3a2a" stroke="#10b981" stroke-width="1.2" filter="url(#shadow)"/>
  <text x="670" y="95" text-anchor="middle" fill="#10b981" font-size="12" font-weight="600">DG-LAB APP</text>

  <!-- ==================== Lifelines ==================== -->
  <line x1="150" y1="108" x2="150" y2="750" stroke="#4a4a6a" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="410" y1="108" x2="410" y2="750" stroke="#4a4a6a" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="670" y1="108" x2="670" y2="750" stroke="#4a4a6a" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- ==================== Phase 1: Connection & Pairing ==================== -->
  <rect x="20" y="120" width="780" height="310" rx="6" fill="#1a1a2e" fill-opacity="0.5" stroke="#334155" stroke-width="0.8"/>
  <rect x="20" y="120" width="140" height="22" rx="6" fill="#334155"/>
  <text x="90" y="135" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="600">Connection &amp; Pairing</text>

  <!-- Step 1: Controller connects -->
  <line x1="158" y1="160" x2="402" y2="160" stroke="#00d2d3" stroke-width="1.5" marker-end="url(#arrowR)"/>
  <rect x="200" y="146" width="140" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="270" y="158" text-anchor="middle" fill="#00d2d3" font-size="10">WS Connect</text>
  <text x="36" y="164" fill="#64748b" font-size="9">1</text>

  <!-- Step 2: Server assigns clientId -->
  <line x1="402" y1="190" x2="158" y2="190" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowLOrange)"/>
  <rect x="195" y="176" width="180" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="285" y="188" text-anchor="middle" fill="#f59e0b" font-size="10">bind: clientId=UUID (targetId="")</text>
  <text x="36" y="194" fill="#64748b" font-size="9">2</text>

  <!-- Step 3: Controller generates QR -->
  <rect x="88" y="210" width="124" height="30" rx="4" fill="#1e3a5c" stroke="#3b82f6" stroke-width="0.8"/>
  <text x="150" y="224" text-anchor="middle" fill="#93c5fd" font-size="9">Generate QR Code</text>
  <text x="150" y="236" text-anchor="middle" fill="#64748b" font-size="8">ws://host:9999/clientId</text>
  <text x="36" y="228" fill="#64748b" font-size="9">3</text>

  <!-- Step 4: APP scans QR and connects -->
  <line x1="662" y1="260" x2="418" y2="260" stroke="#10b981" stroke-width="1.5" marker-end="url(#arrowL)"/>
  <rect x="460" y="246" width="160" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="540" y="258" text-anchor="middle" fill="#10b981" font-size="10">WS Connect (scans QR)</text>
  <text x="36" y="264" fill="#64748b" font-size="9">4</text>

  <!-- Step 5: Server assigns targetId -->
  <line x1="418" y1="290" x2="662" y2="290" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowROrange)"/>
  <rect x="455" y="276" width="170" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="540" y="288" text-anchor="middle" fill="#f59e0b" font-size="10">bind: targetId=UUID</text>
  <text x="36" y="294" fill="#64748b" font-size="9">5</text>

  <!-- Step 6: APP sends bind request -->
  <line x1="662" y1="320" x2="418" y2="320" stroke="#10b981" stroke-width="1.5" marker-end="url(#arrowL)"/>
  <rect x="440" y="306" width="190" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="535" y="318" text-anchor="middle" fill="#10b981" font-size="10">bind: message="DGLAB" (clientId)</text>
  <text x="36" y="324" fill="#64748b" font-size="9">6</text>

  <!-- Step 7: Server confirms pairing -->
  <line x1="402" y1="352" x2="158" y2="352" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowLOrange)"/>
  <rect x="210" y="338" width="150" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="285" y="350" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">bind: message="200" \u2713</text>
  <text x="36" y="356" fill="#64748b" font-size="9">7</text>

  <line x1="418" y1="370" x2="662" y2="370" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowROrange)"/>
  <rect x="470" y="356" width="150" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="545" y="368" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">bind: message="200" \u2713</text>

  <!-- Paired status indicator -->
  <rect x="340" y="392" width="140" height="22" rx="4" fill="#14532d" stroke="#22c55e" stroke-width="1" filter="url(#glow)"/>
  <text x="410" y="407" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600">PAIRED</text>

  <!-- ==================== Phase 2: Strength Control ==================== -->
  <rect x="20" y="428" width="780" height="140" rx="6" fill="#1a1a2e" fill-opacity="0.5" stroke="#334155" stroke-width="0.8"/>
  <rect x="20" y="428" width="140" height="22" rx="6" fill="#334155"/>
  <text x="90" y="443" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="600">Strength Control</text>

  <!-- Controller sends strength command -->
  <line x1="158" y1="468" x2="402" y2="468" stroke="#a29bfe" stroke-width="1.5" marker-end="url(#arrowRPurple)"/>
  <rect x="190" y="454" width="180" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="280" y="466" text-anchor="middle" fill="#a29bfe" font-size="10">type:1/2/3 strength-CH+mode+val</text>

  <!-- Server forwards to APP -->
  <line x1="418" y1="496" x2="662" y2="496" stroke="#a29bfe" stroke-width="1.5" marker-end="url(#arrowRPurple)"/>
  <rect x="440" y="482" width="190" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="535" y="494" text-anchor="middle" fill="#a29bfe" font-size="10">msg: "strength-CH+mode+val"</text>

  <!-- APP sends feedback -->
  <line x1="662" y1="524" x2="418" y2="524" stroke="#10b981" stroke-width="1.5" marker-end="url(#arrowL)"/>
  <rect x="435" y="510" width="198" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="534" y="522" text-anchor="middle" fill="#10b981" font-size="10">msg: "strength-A+B+aLim+bLim"</text>

  <!-- Server forwards feedback to controller -->
  <line x1="402" y1="548" x2="158" y2="548" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowLOrange)"/>
  <rect x="195" y="534" width="180" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="285" y="546" text-anchor="middle" fill="#f59e0b" font-size="10">strength-A+B+aLimit+bLimit</text>

  <!-- ==================== Phase 3: Waveform ==================== -->
  <rect x="20" y="582" width="780" height="140" rx="6" fill="#1a1a2e" fill-opacity="0.5" stroke="#334155" stroke-width="0.8"/>
  <rect x="20" y="582" width="140" height="22" rx="6" fill="#334155"/>
  <text x="90" y="597" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="600">Waveform Sending</text>

  <!-- Controller sends waveform -->
  <line x1="158" y1="622" x2="402" y2="622" stroke="#a29bfe" stroke-width="1.5" marker-end="url(#arrowRPurple)"/>
  <rect x="180" y="608" width="210" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="285" y="620" text-anchor="middle" fill="#a29bfe" font-size="10">clientMsg: CH="A", time=5, [HEX...]</text>

  <!-- Server sends pulse to APP (repeated) -->
  <line x1="418" y1="650" x2="662" y2="650" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowROrange)"/>
  <rect x="454" y="636" width="176" height="16" rx="3" fill="#1a1a2e" fill-opacity="0.9"/>
  <text x="542" y="648" text-anchor="middle" fill="#f59e0b" font-size="10">msg: "pulse-A:[HEX data]"</text>

  <line x1="418" y1="672" x2="662" y2="672" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowROrange)"/>
  <text x="540" y="668" text-anchor="middle" fill="#64748b" font-size="9">repeated per interval</text>

  <line x1="418" y1="696" x2="662" y2="696" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowROrange)"/>
  <text x="540" y="692" text-anchor="middle" fill="#64748b" font-size="9">... until time expires</text>

  <!-- ==================== Legend ==================== -->
  <rect x="20" y="738" width="780" height="30" rx="6" fill="#1a1a2e" fill-opacity="0.6" stroke="#334155" stroke-width="0.5"/>
  <line x1="40" y1="753" x2="64" y2="753" stroke="#00d2d3" stroke-width="1.5"/>
  <text x="70" y="757" fill="#94a3b8" font-size="9">Controller \u2192 Server</text>
  <line x1="190" y1="753" x2="214" y2="753" stroke="#10b981" stroke-width="1.5"/>
  <text x="220" y="757" fill="#94a3b8" font-size="9">APP \u2192 Server</text>
  <line x1="320" y1="753" x2="344" y2="753" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="350" y="757" fill="#94a3b8" font-size="9">Server Response</text>
  <line x1="460" y1="753" x2="484" y2="753" stroke="#a29bfe" stroke-width="1.5"/>
  <text x="490" y="757" fill="#94a3b8" font-size="9">Commands</text>
  <rect x="570" y="748" width="10" height="10" rx="2" fill="#14532d" stroke="#22c55e" stroke-width="0.8"/>
  <text x="586" y="757" fill="#94a3b8" font-size="9">Success</text>
</svg>"""

output_path = "C:/msys64/home/user/projects/coyote-claw/notes/docs/images/protocol-flow.svg"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(svg)
print(f"Written: {output_path}")
