interface Props {
  disabled: boolean;
  onSelect: (channel: string, waveform: string) => void;
  onClear: (channel: number) => void;
  onOpenManager: () => void;
}

const PRESETS: { name: string; data: string; channel: string; bars: number[] }[] = [
  {
    name: "呼吸",
    channel: "A 通道",
    data: '["0A0A0A0A00142864","0A0A0A0A64281400"]',
    bars: [2, 5, 9, 14, 19, 24, 28, 31, 32, 31, 28, 24, 19, 14, 9, 5, 2, 5, 9, 14, 19, 24, 28, 31, 32, 31, 28, 24, 19, 14, 9, 5, 2, 5, 9, 14, 19, 24, 28, 31, 32, 31, 28, 24, 19, 14, 9, 5, 2],
  },
  {
    name: "潮汐",
    channel: "B 通道",
    data: '["0A0A0A0A32326464","0A0A0A0A64643232","0A0A0A0A32326464","0A0A0A0A64643232"]',
    bars: [2, 3, 5, 7, 10, 13, 16, 19, 22, 25, 27, 29, 31, 32, 32, 31, 29, 27, 25, 22, 19, 16, 13, 10, 7, 5, 3, 2, 3, 5, 7, 10, 13, 16, 19, 22, 25, 27, 29, 31, 32, 32, 31, 29, 27, 25, 22, 19],
  },
];

function WaveformBars({ bars }: { bars: number[] }) {
  return (
    <div className="flex w-full items-end gap-px" style={{ height: 32 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-[var(--primary)]"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

function WaveCard({
  name,
  channel,
  bars,
  meta1,
  meta2,
}: {
  name: string;
  channel: string;
  bars: number[];
  meta1: string;
  meta2: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2.5 rounded-lg bg-[var(--secondary)] p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--foreground)]">{name}</span>
        <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-medium text-[var(--primary-foreground)]">
          {channel}
        </span>
      </div>
      <WaveformBars bars={bars} />
      <div className="flex justify-between">
        <span className="text-[11px] text-[var(--muted-foreground)]">{meta1}</span>
        <span className="text-[11px] text-[var(--muted-foreground)]">{meta2}</span>
      </div>
    </div>
  );
}

export function WaveformPanel({ disabled: _disabled, onSelect: _onSelect, onClear: _onClear, onOpenManager }: Props) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 fill-none stroke-[var(--foreground)]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2" />
          </svg>
          <span className="text-base font-semibold text-[var(--foreground)]">当前波形</span>
        </div>
        <button
          onClick={onOpenManager}
          className="rounded-md px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
        >
          波形管理器
        </button>
      </div>

      {/* Wave cards */}
      <div className="flex gap-3">
        <WaveCard
          name="呼吸"
          channel="A 通道"
          bars={PRESETS[0].bars}
          meta1="小节: 1  ·  时长: 4.5s"
          meta2="频率: 节内渐变"
        />
        <WaveCard
          name="潮汐"
          channel="B 通道"
          bars={PRESETS[1].bars}
          meta1="小节: 2  ·  时长: 8.0s"
          meta2="频率: 固定"
        />
      </div>
    </div>
  );
}
