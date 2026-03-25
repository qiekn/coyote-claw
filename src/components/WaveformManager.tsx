interface WaveManagerProps {
  onBack: () => void;
  onEdit: () => void;
}

interface WaveItem {
  name: string;
  channel?: string;
  sections: number;
  duration: string;
  freqMode: string;
  bars: number[];
}

const DEMO_WAVES: WaveItem[] = [
  {
    name: "呼吸",
    channel: "A 通道",
    sections: 1,
    duration: "4.5s",
    freqMode: "节内渐变 100→25Hz",
    bars: [2, 5, 9, 14, 19, 24, 28, 31, 32, 31, 28, 24, 19, 14, 9, 5, 2, 5, 9, 14, 19, 24, 28, 31, 32, 31, 28, 24, 19, 14, 9, 5, 2, 5, 9, 14, 19, 24, 28, 31, 32, 31, 28, 24, 19, 14, 9, 5, 2],
  },
  {
    name: "弹跳",
    channel: "B 通道",
    sections: 1,
    duration: "4.5s",
    freqMode: "节内渐变 100→25Hz",
    bars: [32, 28, 24, 19, 14, 9, 5, 2, 2, 5, 9, 14, 19, 24, 28, 32, 28, 24, 19, 14, 9, 5, 2, 2, 5, 9, 14, 19, 24, 28, 32, 28, 24, 19, 14, 9, 5, 2, 2, 5, 9, 14, 19, 24, 28, 32],
  },
];

function WaveformBars({ bars }: { bars: number[] }) {
  return (
    <div className="flex w-full items-end gap-px rounded-lg bg-[var(--secondary)] p-4" style={{ height: 64 }}>
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

function WaveListItem({ wave, onEdit }: { wave: WaveItem; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--foreground)]">{wave.name}</span>
          {wave.channel && (
            <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-medium text-[var(--primary-foreground)]">
              {wave.channel}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">内置</span>
      </div>

      {/* Bars */}
      <WaveformBars bars={wave.bars} />

      {/* Meta */}
      <div className="flex text-[11px] text-[var(--muted-foreground)]">
        <span>小节: {wave.sections}  ·  时长: {wave.duration}</span>
        <span className="ml-auto">频率: {wave.freqMode}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--secondary)]">
          选择为 A 通道
        </button>
        <button className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--secondary)]">
          选择为 B 通道
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onEdit} className="rounded-md px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">
            编辑
          </button>
          <button className="rounded-md px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">
            复制
          </button>
          <button className="rounded-md bg-[var(--destructive)] px-3 py-1.5 text-xs text-white hover:opacity-80">
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

export function WaveformManager({ onBack, onEdit }: WaveManagerProps) {
  return (
    <div className="font-primary flex flex-col gap-6 rounded-xl bg-[var(--background)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            ← 返回
          </button>
          <svg className="h-5 w-5 fill-none stroke-[var(--foreground)]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2" />
          </svg>
          <span className="text-base font-bold text-[var(--foreground)]">波形管理器</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--secondary)]">
            导入波形
          </button>
          <button className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--secondary)]">
            导出波形
          </button>
          <button className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90">
            + 创建波形
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center rounded-md border border-[var(--input)] bg-transparent px-3 py-2">
          <input
            type="text"
            placeholder="搜索波形..."
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <svg className="h-5 w-5 fill-none stroke-[var(--muted-foreground)]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="text-[13px] text-[var(--muted-foreground)]">共 6 个波形</span>
      </div>

      {/* Wave list */}
      <div className="flex flex-col gap-3">
        {DEMO_WAVES.map((wave) => (
          <WaveListItem key={wave.name} wave={wave} onEdit={onEdit} />
        ))}
      </div>

      {/* Drop zone */}
      <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] py-6">
        <svg className="h-5 w-5 fill-none stroke-[var(--muted-foreground)]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-[13px] text-[var(--muted-foreground)]">
          拖放 .pulse 文件到此处快速导入
        </span>
      </div>
    </div>
  );
}
