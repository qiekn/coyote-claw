import { useCallback, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { ConnectView } from "./components/ConnectView";
import { DashboardView } from "./components/DashboardView";
import { WaveformsView } from "./components/WaveformsView";
import { WaveformEditorModal } from "./components/WaveformEditorModal";
import { useWsServer } from "./hooks/useWsServer";
import { BUILTIN_WAVEFORMS, type Waveform } from "./lib/presets";

export type View = "connect" | "dashboard" | "waveforms";
export type Channel = "A" | "B";
export type DisplayMode = "PCT" | "ABS";

export interface ChannelUI {
  boost: number;
  isFiring: boolean;
  preFire: number;
  activeWave: string | null;
}

const initialChannel: ChannelUI = {
  boost: 150,
  isFiring: false,
  preFire: 0,
  activeWave: null,
};

function App() {
  const { status, qrcodeUrl, strength, sendStrength, sendWaveform, clearWaveform } =
    useWsServer();

  const [view, setView] = useState<View>("dashboard");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("PCT");
  const [chA, setChA] = useState<ChannelUI>(initialChannel);
  const [chB, setChB] = useState<ChannelUI>(initialChannel);
  const [waveforms, setWaveforms] = useState<Waveform[]>(BUILTIN_WAVEFORMS);
  const [editorWaveId, setEditorWaveId] = useState<string | null | undefined>(undefined);

  const isPaired = status === "Paired";

  const updateChannel = useCallback((ch: Channel, patch: Partial<ChannelUI>) => {
    if (ch === "A") setChA((s) => ({ ...s, ...patch }));
    else setChB((s) => ({ ...s, ...patch }));
  }, []);

  const applyWaveform = useCallback(
    async (waveId: string, ch: Channel) => {
      const wave = waveforms.find((w) => w.id === waveId);
      if (!wave) return;
      const current = ch === "A" ? chA : chB;
      if (current.activeWave === waveId) {
        // toggle off
        updateChannel(ch, { activeWave: null });
        await clearWaveform(ch === "A" ? 1 : 2).catch(() => {});
        return;
      }
      updateChannel(ch, { activeWave: waveId });
      const payload = JSON.stringify(wave.frames);
      await sendWaveform(ch, payload).catch(() => {});
    },
    [waveforms, chA, chB, updateChannel, clearWaveform, sendWaveform],
  );

  const stopWaveformOnChannel = useCallback(
    async (ch: Channel) => {
      updateChannel(ch, { activeWave: null });
      await clearWaveform(ch === "A" ? 1 : 2).catch(() => {});
    },
    [updateChannel, clearWaveform],
  );

  const editingWaveform = useMemo(() => {
    if (editorWaveId === undefined) return undefined;
    if (editorWaveId === null) return null;
    return waveforms.find((w) => w.id === editorWaveId) ?? null;
  }, [editorWaveId, waveforms]);

  const onSaveWaveform = useCallback(
    (name: string, frames: string[]) => {
      if (editorWaveId) {
        setWaveforms((list) =>
          list.map((w) => (w.id === editorWaveId ? { ...w, name, frames } : w)),
        );
      } else {
        setWaveforms((list) => [
          ...list,
          { id: `usr_${Date.now()}`, name, frames, readonly: false },
        ]);
      }
      setEditorWaveId(undefined);
    },
    [editorWaveId],
  );

  const onDeleteWaveform = useCallback(
    (id: string) => {
      setWaveforms((list) => list.filter((w) => w.id !== id));
      if (chA.activeWave === id) updateChannel("A", { activeWave: null });
      if (chB.activeWave === id) updateChannel("B", { activeWave: null });
    },
    [chA.activeWave, chB.activeWave, updateChannel],
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header view={view} onViewChange={setView} status={status} />

      {view === "connect" && (
        <ConnectView qrcodeUrl={qrcodeUrl} status={status} />
      )}

      {view === "dashboard" && (
        <DashboardView
          strength={strength}
          chA={chA}
          chB={chB}
          updateChannel={updateChannel}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          waveforms={waveforms}
          paired={isPaired}
          onSendStrength={sendStrength}
          onStopWaveform={stopWaveformOnChannel}
        />
      )}

      {view === "waveforms" && (
        <WaveformsView
          waveforms={waveforms}
          onWaveformsChange={setWaveforms}
          chA={chA}
          chB={chB}
          onApplyWaveform={applyWaveform}
          onEditWaveform={(id) => setEditorWaveId(id)}
          onDeleteWaveform={onDeleteWaveform}
          onCreateWaveform={() => setEditorWaveId(null)}
        />
      )}

      {editingWaveform !== undefined && (
        <WaveformEditorModal
          editing={editingWaveform}
          onClose={() => setEditorWaveId(undefined)}
          onSave={onSaveWaveform}
        />
      )}
    </div>
  );
}

export default App;
