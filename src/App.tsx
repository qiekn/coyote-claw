import { ConnectionPanel } from "./components/ConnectionPanel";
import { StrengthPanel } from "./components/StrengthPanel";
import { WaveformPanel } from "./components/WaveformPanel";
import { useWsServer } from "./hooks/useWsServer";

function App() {
  const { status, qrcodeUrl, strength, sendStrength, sendWaveform, clearWaveform } =
    useWsServer();

  const isPaired = status === "Paired";

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-gray-900 p-6">
      <h1 className="text-center text-2xl font-bold text-white">
        Coyote Claw 郊狼爪爪
      </h1>
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
      />
    </main>
  );
}

export default App;
