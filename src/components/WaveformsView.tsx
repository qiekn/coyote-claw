import { useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";
import type { Channel, ChannelUI } from "../App";
import type { Waveform } from "../lib/presets";
import { getIntensityFromHex } from "../lib/waveforms";

interface Props {
  waveforms: Waveform[];
  onWaveformsChange: (next: Waveform[]) => void;
  chA: ChannelUI;
  chB: ChannelUI;
  onApplyWaveform: (id: string, ch: Channel) => void;
  onEditWaveform: (id: string) => void;
  onDeleteWaveform: (id: string) => void;
  onCreateWaveform: () => void;
}

const PIXELS_PER_MS = 0.04;
const FRAME_PX = 4; // bar 3px + gap 1px

interface PreviewState {
  playing: boolean;
  looping: boolean;
  offset: number;
}

export function WaveformsView(props: Props) {
  const { waveforms, onWaveformsChange } = props;
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  // Refs of running tracks for animation
  const trackRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const containerRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});
  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  // Ensure each waveform has a preview entry
  useEffect(() => {
    setPreviews((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const w of waveforms) {
        if (!next[w.id]) {
          next[w.id] = { playing: false, looping: false, offset: 0 };
          changed = true;
        }
      }
      // remove deleted
      for (const id of Object.keys(next)) {
        if (!waveforms.find((w) => w.id === id)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [waveforms]);

  // Animation loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      const cur = previewsRef.current;
      let mutated: Record<string, PreviewState> | null = null;
      for (const id of Object.keys(cur)) {
        const p = cur[id];
        if (!p.playing) continue;
        const wave = waveforms.find((w) => w.id === id);
        if (!wave) continue;
        const repWidth = wave.frames.length * FRAME_PX;
        let offset = p.offset - PIXELS_PER_MS * delta;
        let ended = false;
        if (offset <= -repWidth) {
          if (p.looping) {
            offset += repWidth;
          } else {
            offset = 0;
            ended = true;
          }
        }
        const track = trackRefs.current.get(id);
        if (track) track.style.transform = `translateX(${offset}px)`;
        if (ended) {
          mutated = mutated ?? { ...cur };
          mutated[id] = { ...p, playing: false, offset: 0 };
        } else {
          // mutate without triggering re-render
          p.offset = offset;
        }
      }
      if (mutated) setPreviews(mutated);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [waveforms]);

  // Setup sortable
  useEffect(() => {
    if (!listRef.current) return;
    sortableRef.current?.destroy();
    sortableRef.current = Sortable.create(listRef.current, {
      animation: 250,
      ghostClass: "sortable-ghost",
      forceFallback: true,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: true,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      filter: "button, button *, .preview-container",
      preventOnFilter: false,
      onEnd: (evt) => {
        if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
        if (evt.oldIndex === evt.newIndex) return;
        const next = [...waveforms];
        const [moved] = next.splice(evt.oldIndex, 1);
        next.splice(evt.newIndex, 0, moved);
        // SortableJS already moved DOM; sync state
        onWaveformsChange(next);
      },
    });
    return () => {
      sortableRef.current?.destroy();
      sortableRef.current = null;
    };
  }, [waveforms, onWaveformsChange]);

  const togglePlay = (id: string) => {
    setPreviews((prev) => {
      const cur = prev[id] ?? { playing: false, looping: false, offset: 0 };
      return { ...prev, [id]: { ...cur, playing: !cur.playing, offset: 0 } };
    });
  };
  const toggleLoop = (id: string) => {
    setPreviews((prev) => {
      const cur = prev[id] ?? { playing: false, looping: false, offset: 0 };
      const looping = !cur.looping;
      const playing = looping ? true : cur.playing;
      return {
        ...prev,
        [id]: { ...cur, looping, playing, offset: looping && !cur.playing ? 0 : cur.offset },
      };
    });
  };

  return (
    <main className="flex w-full flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 md:p-8">
        <div className="mb-6 flex items-end justify-between border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-wider text-white">WAVEFORM MANAGER</h2>
            <p className="mt-1 text-sm text-gray-400">
              拖拽波形进行排序。播放/循环按钮控制预览。(单格宽度=100ms)
            </p>
          </div>
          <button
            onClick={props.onCreateWaveform}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all hover:bg-indigo-500 active:scale-95"
          >
            + 创建新波形
          </button>
        </div>

        <div ref={listRef} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {waveforms.map((wave) => {
            const preview = previews[wave.id] ?? {
              playing: false,
              looping: false,
              offset: 0,
            };
            const isPlayingA = props.chA.activeWave === wave.id;
            const isPlayingB = props.chB.activeWave === wave.id;
            const totalSeconds = (wave.frames.length * 0.1).toFixed(1);
            return (
              <div
                key={wave.id}
                data-id={wave.id}
                className="group flex cursor-grab flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800/80 p-4 transition-all duration-200 active:cursor-grabbing"
              >
                <div className="flex items-center justify-between">
                  <div className="pointer-events-none flex items-center overflow-hidden">
                    <div className="truncate">
                      <h3 className="flex items-center gap-2 truncate text-base font-bold text-gray-200">
                        {wave.name}
                        {wave.readonly && (
                          <span className="shrink-0 rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400">
                            官方
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 truncate text-[10px] text-gray-500">
                        时长: {totalSeconds}s | 帧数: {wave.frames.length}
                      </p>
                    </div>
                  </div>
                  <div
                    className="relative z-10 ml-2 flex shrink-0 gap-1.5"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleLoop(wave.id)}
                      title="单曲循环"
                      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                        preview.looping
                          ? "bg-indigo-600 text-white shadow-[0_0_8px_rgba(79,70,229,0.8)]"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => togglePlay(wave.id)}
                      title="播放波形"
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${
                        preview.playing
                          ? "bg-pink-600 text-white shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                          : "bg-gray-700 text-gray-300 hover:bg-pink-600"
                      }`}
                    >
                      {preview.playing ? "■" : "▶"}
                    </button>
                    <button
                      onClick={() => props.onApplyWaveform(wave.id, "A")}
                      title={isPlayingA ? "停止 CH A" : "应用到 CH A"}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-all ${
                        isPlayingA
                          ? "bg-cyan-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                          : "bg-gray-700 text-gray-300 hover:bg-cyan-900/80 hover:text-cyan-400"
                      }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => props.onApplyWaveform(wave.id, "B")}
                      title={isPlayingB ? "停止 CH B" : "应用到 CH B"}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-all ${
                        isPlayingB
                          ? "bg-orange-600 text-white shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                          : "bg-gray-700 text-gray-300 hover:bg-orange-900/80 hover:text-orange-400"
                      }`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => props.onEditWaveform(wave.id)}
                      title="编辑波形"
                      className="flex h-7 w-7 items-center justify-center rounded bg-gray-700 text-gray-300 transition-colors hover:bg-indigo-600 hover:text-white"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    {!wave.readonly && (
                      <button
                        onClick={() => props.onDeleteWaveform(wave.id)}
                        title="删除"
                        className="flex h-7 w-7 items-center justify-center rounded bg-red-900/30 text-red-400 transition-colors hover:bg-red-600 hover:text-white"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div
                  ref={(el) => {
                    containerRefs.current.set(wave.id, el);
                  }}
                  className="preview-container hide-scrollbar relative h-16 w-full overflow-x-auto rounded border border-gray-800 bg-black/40 p-1"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div
                    ref={(el) => {
                      trackRefs.current.set(wave.id, el);
                    }}
                    className="absolute left-0 flex h-full w-max items-end"
                    style={{
                      paddingRight: preview.playing && !preview.looping ? "100%" : "8px",
                      transform: `translateX(${preview.playing ? preview.offset : 0}px)`,
                    }}
                  >
                    {(() => {
                      const repCount =
                        preview.playing && preview.looping ? 4 : 1;
                      return Array.from({ length: repCount }).map((_, repIdx) => (
                        <div
                          key={repIdx}
                          className="flex h-full shrink-0 items-end"
                        >
                          {wave.frames.map((hex, i) => {
                            const intensity = getIntensityFromHex(hex);
                            const height = Math.max(intensity, 2);
                            return (
                              <div
                                key={i}
                                className="shrink-0 rounded-sm bg-indigo-500"
                                style={{
                                  width: 3,
                                  height: `${height}%`,
                                  marginRight: 1,
                                }}
                              />
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
