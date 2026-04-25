import { useEffect, useMemo, useRef, useState } from "react";
import type { Waveform } from "../lib/presets";
import { buildV3Hex, clampInt, parseV3Hex } from "../lib/waveforms";

interface Props {
  /** null = create new, Waveform = edit existing */
  editing: Waveform | null;
  onClose: () => void;
  onSave: (name: string, frames: string[]) => void;
}

export function WaveformEditorModal({ editing, onClose, onSave }: Props) {
  const [name, setName] = useState(editing?.name ?? "新建波形");
  const [frames, setFrames] = useState<string[]>(() => {
    if (editing) return [...editing.frames];
    const def = buildV3Hex(10, 80);
    return [def, def];
  });
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [zoom, setZoom] = useState<number>(4);
  const [freq, setFreq] = useState<number>(10);
  const [intensity, setIntensity] = useState<number>(80);
  const [rawTextOverride, setRawTextOverride] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const rawRef = useRef<HTMLTextAreaElement>(null);
  const [animKey, setAnimKey] = useState(0);

  // open animation
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, []);

  // sync inputs when selection changes
  useEffect(() => {
    if (selectedIdx === -1) return;
    const f = frames[selectedIdx];
    if (!f) return;
    const parsed = parseV3Hex(f);
    setFreq(parsed.freq);
    setIntensity(parsed.intPct);
  }, [selectedIdx, frames]);

  // Keyboard shortcuts: arrows / WASD
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      const t = document.activeElement as HTMLInputElement | null;
      if (tag === "TEXTAREA") return;
      if (tag === "INPUT" && t && (t.type === "text" || t.type === "number")) return;
      if (selectedIdx === -1) return;

      let handled = false;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W": {
          const next = clampInt(intensity + 5, 0, 100);
          setIntensity(next);
          setFrames((arr) => {
            const cp = [...arr];
            cp[selectedIdx] = buildV3Hex(freq, next);
            return cp;
          });
          handled = true;
          break;
        }
        case "ArrowDown":
        case "s":
        case "S": {
          const next = clampInt(intensity - 5, 0, 100);
          setIntensity(next);
          setFrames((arr) => {
            const cp = [...arr];
            cp[selectedIdx] = buildV3Hex(freq, next);
            return cp;
          });
          handled = true;
          break;
        }
        case "ArrowLeft":
        case "a":
        case "A": {
          if (selectedIdx > 0) {
            setSelectedIdx(selectedIdx - 1);
            scrollPreviewTo(selectedIdx - 1);
          }
          handled = true;
          break;
        }
        case "ArrowRight":
        case "d":
        case "D": {
          if (selectedIdx < frames.length - 1) {
            setSelectedIdx(selectedIdx + 1);
            scrollPreviewTo(selectedIdx + 1);
          }
          handled = true;
          break;
        }
      }
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIdx, intensity, freq, frames.length]);

  const scrollPreviewTo = (idx: number) => {
    const el = previewRef.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const totalSeconds = useMemo(() => (frames.length * 0.1).toFixed(1), [frames.length]);

  const onZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => clampInt(z + (e.deltaY > 0 ? -1 : 1), 1, 20));
  };

  const updateSelectedFromInputs = (newFreq: number, newInt: number) => {
    if (selectedIdx === -1) return;
    setFrames((arr) => {
      const cp = [...arr];
      cp[selectedIdx] = buildV3Hex(newFreq, newInt);
      return cp;
    });
  };

  const onFreqChange = (v: number) => {
    const next = clampInt(v, 10, 240);
    setFreq(next);
    updateSelectedFromInputs(next, intensity);
  };
  const onIntensityChange = (v: number) => {
    const next = clampInt(v, 0, 100);
    setIntensity(next);
    updateSelectedFromInputs(freq, next);
  };

  const onAddFrame = () => {
    const i = clampInt(intensity, 0, 100);
    const f = clampInt(freq, 10, 240);
    const hex = buildV3Hex(f, i);
    setFrames((arr) => {
      const cp = [...arr];
      if (selectedIdx !== -1) {
        cp.splice(selectedIdx + 1, 0, hex);
        setSelectedIdx(selectedIdx + 1);
      } else {
        cp.push(hex);
        setSelectedIdx(cp.length - 1);
      }
      return cp;
    });
    setTimeout(() => {
      const el = previewRef.current;
      if (el) el.scrollLeft = el.scrollWidth;
    }, 50);
  };

  const onDeleteFrame = () => {
    setFrames((arr) => {
      const cp = [...arr];
      if (selectedIdx !== -1) {
        if (selectedIdx < cp.length - 1) cp.splice(selectedIdx + 1, 1);
      } else if (cp.length > 0) {
        cp.pop();
      }
      return cp;
    });
  };

  const onRawChange = (text: string) => {
    setRawTextOverride(text);
    const lines = text
      .split("\n")
      .map((l) => l.trim().toUpperCase())
      .filter((l) => /^[0-9A-F]{16}$/.test(l));
    setFrames(lines);
    if (selectedIdx >= lines.length) setSelectedIdx(-1);
  };

  const onSaveClick = () => {
    if (frames.length === 0) {
      alert("至少需要一个 100ms 的脉冲帧！");
      return;
    }
    onSave(name.trim() || "未命名波形", frames);
  };

  // raw textarea displays computed unless user is typing
  const rawDisplay = rawTextOverride ?? frames.join("\n");

  const canDelete = selectedIdx === -1 ? frames.length > 0 : selectedIdx < frames.length - 1;

  return (
    <div
      key={animKey}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-800/50 p-4">
          <h3 className="text-xl font-bold text-indigo-400">
            {editing ? "编辑波形" : "创建新波形"}
          </h3>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-400">波形名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-700 bg-black/50 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-2 flex items-center justify-between text-sm font-bold text-gray-400">
                <span>可视化预览 (W/A/S/D / 选帧)</span>
                <span className="text-xs text-indigo-400">Total: {totalSeconds}s</span>
              </label>
              <div
                ref={previewRef}
                onWheel={onZoom}
                className="flex h-40 w-full items-end overflow-x-auto rounded-lg border border-gray-800 bg-black/60 p-3 scroll-smooth"
              >
                {frames.map((hex, idx) => {
                  const { intPct } = parseV3Hex(hex);
                  const height = Math.max(intPct, 2);
                  const selected = idx === selectedIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      title={`Frame ${idx + 1}: 强度 ${intPct}%`}
                      className={`shrink-0 cursor-pointer rounded-sm transition-all hover:bg-indigo-300 ${
                        selected
                          ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                          : "bg-indigo-500"
                      }`}
                      style={{
                        width: zoom,
                        height: `${height}%`,
                        marginRight: Math.max(1, Math.floor(zoom / 3)),
                        transformOrigin: "bottom",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 flex justify-between text-sm font-bold text-gray-400">
                <span>Raw Data (HEX)</span>
                <span className="text-xs font-normal text-gray-500">
                  可手动编辑精准控制
                </span>
              </label>
              <textarea
                ref={rawRef}
                value={rawDisplay}
                onChange={(e) => onRawChange(e.target.value)}
                onBlur={() => setRawTextOverride(null)}
                spellCheck={false}
                className="h-40 w-full resize-none rounded border border-gray-700 bg-black/50 p-3 font-mono text-sm leading-relaxed tracking-widest text-cyan-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 shadow-inner">
            <div className="mb-4 flex items-end justify-between border-b border-gray-700 pb-2">
              <h4 className="font-bold text-gray-300">参数调节面板</h4>
              <span className="rounded border border-gray-600 bg-gray-900 px-2 py-1 text-xs text-gray-400">
                {selectedIdx === -1 ? (
                  "未选中 (新增/删除将作用于末尾)"
                ) : (
                  <span className="text-emerald-400">
                    已选中第 {selectedIdx + 1} 帧 (操作将作用于其后)
                  </span>
                )}
              </span>
            </div>

            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex flex-1 flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold tracking-widest text-cyan-500 uppercase">
                    Frequency{" "}
                    <span className="text-xs text-gray-500 normal-case">(频率 10-240)</span>
                  </label>
                  <input
                    type="number"
                    value={freq}
                    min={10}
                    max={240}
                    onChange={(e) => onFreqChange(parseInt(e.target.value) || 10)}
                    className="font-digital w-20 rounded border border-cyan-900 bg-gray-900 px-2 py-1 text-center text-cyan-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={10}
                  max={240}
                  value={freq}
                  onChange={(e) => onFreqChange(parseInt(e.target.value))}
                  className="cyan-slider"
                />
                <div className="flex flex-1 items-end pt-2">
                  <button
                    onClick={onDeleteFrame}
                    disabled={!canDelete}
                    className="w-full rounded-lg border border-red-900/50 bg-red-600/10 py-3 font-bold tracking-wider text-red-500 transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    × 删除后帧 (Del Next)
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold tracking-widest text-orange-500 uppercase">
                    Intensity{" "}
                    <span className="text-xs text-gray-500 normal-case">(强度 0-100%)</span>
                  </label>
                  <input
                    type="number"
                    value={intensity}
                    min={0}
                    max={100}
                    onChange={(e) => onIntensityChange(parseInt(e.target.value) || 0)}
                    className="font-digital w-20 rounded border border-orange-900 bg-gray-900 px-2 py-1 text-center text-orange-400 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={intensity}
                  onChange={(e) => onIntensityChange(parseInt(e.target.value))}
                  className="orange-slider"
                />
                <div className="flex flex-1 items-end pt-2">
                  <button
                    onClick={onAddFrame}
                    className="w-full rounded-lg border border-indigo-600/50 bg-indigo-600/20 py-3 font-bold tracking-wider text-indigo-400 transition-colors hover:bg-indigo-600 hover:text-white"
                  >
                    + 新增后帧 (Add Next)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-800 bg-gray-800/80 p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-700 px-6 py-2 font-bold text-white transition-colors hover:bg-gray-600"
          >
            取消
          </button>
          <button
            onClick={onSaveClick}
            className="rounded-lg bg-indigo-600 px-8 py-2 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
