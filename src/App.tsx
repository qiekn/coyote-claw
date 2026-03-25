import { useState } from "react";
import { ConnectionPanel } from "./components/ConnectionPanel";
import { StrengthPanel } from "./components/StrengthPanel";
import { WaveformPanel } from "./components/WaveformPanel";
import { WaveformManager } from "./components/WaveformManager";
import { WaveformEditor } from "./components/WaveformEditor";
import { useWsServer } from "./hooks/useWsServer";

type View = "home" | "manager" | "editor";

function App() {
  const { status, qrcodeUrl, strength, sendStrength, sendWaveform, clearWaveform } =
    useWsServer();
  const [view, setView] = useState<View>("home");

  const isPaired = status === "Paired";

  if (view === "editor") {
    return <WaveformEditor onBack={() => setView("manager")} />;
  }

  if (view === "manager") {
    return (
      <WaveformManager
        onBack={() => setView("home")}
        onEdit={() => setView("editor")}
      />
    );
  }

  return (
    <main className="font-primary flex min-h-screen flex-col gap-6 bg-[var(--background)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 fill-[var(--foreground)]" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-xl font-bold text-[var(--foreground)]">Coyote Claw</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <ConnectionPanel status={status} qrcodeUrl={qrcodeUrl} />

      <StrengthPanel
        strength={strength}
        disabled={!isPaired}
        onStrength={sendStrength}
      />

      <WaveformPanel
        disabled={!isPaired}
        onSelect={sendWaveform}
        onClear={clearWaveform}
        onOpenManager={() => setView("manager")}
      />
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const text: Record<string, string> = {
    Disconnected: "未连接",
    WaitingForApp: "等待连接",
    AppConnected: "绑定中...",
    Paired: "已配对",
  };

  const dotColor: Record<string, string> = {
    Disconnected: "bg-red-500",
    WaitingForApp: "bg-yellow-500",
    AppConnected: "bg-blue-500",
    Paired: "bg-green-500",
  };

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[var(--secondary)] px-2.5 py-1">
      <div className={`h-2 w-2 rounded-full ${dotColor[status] ?? "bg-red-500"}`} />
      <span className="text-xs font-medium text-[var(--muted-foreground)]">
        {text[status] ?? status}
      </span>
    </div>
  );
}

export default App;
