import { useEffect, useRef, useState } from "react";
import type { Channel, ChannelUI, DisplayMode } from "../App";
import type { StrengthData } from "../hooks/useWsServer";
import type { Waveform } from "../lib/presets";
import { clampInt } from "../lib/waveforms";

interface Props {
  strength: StrengthData;
  chA: ChannelUI;
  chB: ChannelUI;
  updateChannel: (ch: Channel, patch: Partial<ChannelUI>) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (m: DisplayMode) => void;
  waveforms: Waveform[];
  paired: boolean;
  onSendStrength: (channel: number, mode: number, value: number) => Promise<void>;
  onStopWaveform: (ch: Channel) => void;
}

const DASH_MAX = 2 * Math.PI * 40;
const DASH_MIN = DASH_MAX - DASH_MAX * 0.75;

export function DashboardView(props: Props) {
  const { strength, chA, chB, displayMode, onDisplayModeChange, waveforms } = props;

  return (
    <main className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-4 lg:flex-row">
      <div className="font-digital absolute top-4 right-4 z-50 flex rounded-lg border border-gray-700 bg-gray-900/80 p-1.5 text-sm shadow-xl backdrop-blur-md md:right-8">
        <button
          onClick={() => onDisplayModeChange("PCT")}
          className={`rounded px-4 py-1.5 tracking-wider transition-all ${
            displayMode === "PCT"
              ? "bg-gray-700 font-bold text-white shadow-sm"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          PCT %
        </button>
        <button
          onClick={() => onDisplayModeChange("ABS")}
          className={`rounded px-4 py-1.5 tracking-wider transition-all ${
            displayMode === "ABS"
              ? "bg-gray-700 font-bold text-white shadow-sm"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          ABS 200
        </button>
      </div>

      <ChannelPanel
        ch="A"
        current={strength.a}
        limit={strength.aLimit}
        ui={chA}
        displayMode={displayMode}
        waveforms={waveforms}
        paired={props.paired}
        updateChannel={props.updateChannel}
        onSendStrength={props.onSendStrength}
        onStopWaveform={() => props.onStopWaveform("A")}
      />
      <ChannelPanel
        ch="B"
        current={strength.b}
        limit={strength.bLimit}
        ui={chB}
        displayMode={displayMode}
        waveforms={waveforms}
        paired={props.paired}
        updateChannel={props.updateChannel}
        onSendStrength={props.onSendStrength}
        onStopWaveform={() => props.onStopWaveform("B")}
      />
    </main>
  );
}

interface PanelProps {
  ch: Channel;
  current: number;
  limit: number;
  ui: ChannelUI;
  displayMode: DisplayMode;
  waveforms: Waveform[];
  paired: boolean;
  updateChannel: (ch: Channel, patch: Partial<ChannelUI>) => void;
  onSendStrength: (channel: number, mode: number, value: number) => Promise<void>;
  onStopWaveform: () => void;
}

function ChannelPanel({
  ch,
  current,
  limit,
  ui,
  displayMode,
  waveforms,
  paired,
  updateChannel,
  onSendStrength,
  onStopWaveform,
}: PanelProps) {
  const cyan = ch === "A";
  const colorClasses = cyan
    ? {
        text: "text-cyan-500",
        glow: "glow-cyan",
        box: "box-glow-cyan",
        slider: "cyan-slider",
        unit: "text-cyan-500/70",
        stroke: "#06b6d4",
        focus: "focus:border-cyan-500",
        focusFire: "text-cyan-400 focus:border-cyan-500",
        hoverBorder: "hover:border-cyan-500/50",
        hoverText: "hover:text-cyan-400",
        badgeBg: "bg-cyan-900/30 border-cyan-500/30 text-cyan-400",
      }
    : {
        text: "text-orange-500",
        glow: "glow-orange",
        box: "box-glow-orange",
        slider: "orange-slider",
        unit: "text-orange-500/70",
        stroke: "#f97316",
        focus: "focus:border-orange-500",
        focusFire: "text-orange-400 focus:border-orange-500",
        hoverBorder: "hover:border-orange-500/50",
        hoverText: "hover:text-orange-400",
        badgeBg: "bg-orange-900/30 border-orange-500/30 text-orange-400",
      };

  const channelNum = ch === "A" ? 1 : 2;
  const pct = limit > 0 ? (current / limit) * 100 : 0;
  const safePct = Math.max(0, Math.min(100, pct));
  const offset = DASH_MAX - (safePct / 100) * (DASH_MAX - DASH_MIN);
  const displayVal = Math.round(displayMode === "PCT" ? pct : current);
  const sliderMax = displayMode === "PCT" ? 100 : limit;

  // local input state so user can type without each keystroke pushing
  const [directInput, setDirectInput] = useState<string>(String(displayVal));
  const directFocused = useRef(false);
  useEffect(() => {
    if (!directFocused.current) setDirectInput(String(displayVal));
  }, [displayVal]);

  const fireBtnRef = useRef<HTMLButtonElement>(null);

  const sendAbsolute = (absVal: number) => {
    const v = clampInt(Math.round(absVal), 0, limit);
    return onSendStrength(channelNum, 2, v);
  };

  const onChange = (delta: number) => {
    if (ui.isFiring || !paired) return;
    if (delta > 0) onSendStrength(channelNum, 1, Math.abs(delta));
    else onSendStrength(channelNum, 0, Math.abs(delta));
  };

  const onSliderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (ui.isFiring || !paired) return;
    const v = parseFloat(e.target.value);
    const abs = displayMode === "PCT" ? (v / 100) * limit : v;
    sendAbsolute(abs);
  };

  const onDirectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (ui.isFiring || !paired) return;
      const v = parseFloat(directInput);
      if (Number.isNaN(v)) return;
      const abs = displayMode === "PCT" ? (v / 100) * limit : v;
      sendAbsolute(abs);
      (e.target as HTMLInputElement).blur();
    }
  };

  const startFire = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (ui.isFiring || !paired) return;
    const target = Math.min(ui.boost, limit);
    updateChannel(ch, { isFiring: true, preFire: current });
    sendAbsolute(target);
  };
  const stopFire = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!ui.isFiring) return;
    sendAbsolute(ui.preFire);
    updateChannel(ch, { isFiring: false });
  };

  const playingWave = ui.activeWave
    ? waveforms.find((w) => w.id === ui.activeWave)
    : null;

  return (
    <div
      className={`relative mt-12 flex w-full max-w-md flex-col items-center rounded-3xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm lg:mt-0 ${colorClasses.box}`}
    >
      <div className="mb-2 flex w-full items-center justify-between">
        <h2 className={`text-2xl font-bold tracking-widest ${colorClasses.text}`}>
          CH {ch}
        </h2>
        {playingWave && (
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${colorClasses.badgeBg}`}
          >
            <span className="animate-pulse">▶</span>
            <span>{playingWave.name}</span>
            <button
              onClick={onStopWaveform}
              title="停止波形"
              className="ml-2 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="relative mb-6 h-64 w-64">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#1f2937"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset="62.8"
            transform="rotate(-210 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={colorClasses.stroke}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="gauge-circle"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-digital text-6xl font-bold text-white ${colorClasses.glow}`}
          >
            {displayVal}
          </span>
          <span
            className={`mt-1 text-sm font-bold tracking-widest ${colorClasses.unit}`}
          >
            {displayMode === "PCT" ? "%" : `/ ${limit}`}
          </span>
        </div>
      </div>

      <div className="w-full space-y-6">
        <div className="flex justify-between gap-4">
          <button
            onClick={() => onChange(-1)}
            disabled={!paired || ui.isFiring}
            className={`btn-press no-select flex-1 rounded-xl border border-gray-700 bg-gray-800 py-3 text-xl font-bold text-gray-300 transition-colors disabled:opacity-40 ${colorClasses.hoverBorder} ${colorClasses.hoverText}`}
          >
            - 1
          </button>
          <button
            onClick={() => onChange(1)}
            disabled={!paired || ui.isFiring}
            className={`btn-press no-select flex-1 rounded-xl border border-gray-700 bg-gray-800 py-3 text-xl font-bold text-gray-300 transition-colors disabled:opacity-40 ${colorClasses.hoverBorder} ${colorClasses.hoverText}`}
          >
            + 1
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
            <span>Min</span>
            <span>Throttle (Set To)</span>
            <span>{displayMode === "PCT" ? "100%" : limit}</span>
          </div>
          <input
            type="range"
            className={colorClasses.slider}
            min={0}
            max={sliderMax}
            value={displayVal}
            disabled={!paired || ui.isFiring}
            onChange={onSliderInput}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-950/50 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-center text-[10px] font-bold text-gray-500 uppercase">
                Set Value
              </label>
              <input
                type="number"
                value={directInput}
                onFocus={() => (directFocused.current = true)}
                onBlur={() => {
                  directFocused.current = false;
                  setDirectInput(String(displayVal));
                }}
                onChange={(e) => setDirectInput(e.target.value)}
                onKeyDown={onDirectKeyDown}
                disabled={!paired || ui.isFiring}
                className={`font-digital w-full rounded border border-gray-700 bg-gray-800 p-2 text-center font-bold text-white transition-colors focus:outline-none disabled:opacity-40 ${colorClasses.focus}`}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-center text-[10px] font-bold text-gray-500 uppercase">
                Boost Value
              </label>
              <input
                type="number"
                value={ui.boost}
                onChange={(e) => {
                  const v = clampInt(parseInt(e.target.value), 0, 200);
                  updateChannel(ch, { boost: Math.min(v, limit) });
                }}
                className={`font-digital w-full rounded border border-gray-700 bg-gray-800 p-2 text-center font-bold transition-colors focus:outline-none ${colorClasses.focusFire}`}
              />
            </div>
          </div>
          <button
            ref={fireBtnRef}
            data-firing={ui.isFiring ? "true" : undefined}
            onPointerDown={startFire}
            onPointerUp={stopFire}
            onPointerLeave={(e) => ui.isFiring && stopFire(e)}
            onPointerCancel={stopFire}
            disabled={!paired}
            className="fire-btn no-select mt-1 h-14 w-full rounded-lg bg-red-600 font-black tracking-wider text-white italic shadow-[0_0_15px_rgba(220,38,38,0.4),0_5px_0_#7f1d1d] transition-all duration-100 hover:bg-red-500 active:translate-y-1 active:shadow-[0_0_15px_rgba(220,38,38,0.4),0_0_0_#7f1d1d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            FIRE!
          </button>
        </div>
      </div>
    </div>
  );
}
