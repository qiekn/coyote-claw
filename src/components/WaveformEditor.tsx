export function WaveformEditor({ onBack }: { onBack: () => void }) {
  return (
    <div className="font-primary flex flex-col overflow-hidden rounded-xl bg-[var(--background)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            ← 返回
          </button>
          <span className="text-base font-bold text-[var(--foreground)]">弹跳</span>
          <span className="text-sm text-[var(--muted-foreground)]">导入</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">
            <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5,3 19,12 5,21 5,3" />
            </svg>
            预览
          </button>
          <button className="flex items-center gap-1 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]">
            <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17,21 17,13 7,13 7,21" />
              <polyline points="7,3 7,8 15,8" />
            </svg>
            保存
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative p-6">
        {/* Global settings */}
        <div className="flex gap-4">
          <SettingBox label="休息时长" value="2.0 秒" />
          <SettingBox label="速度倍率" value="1x" />
          <SettingBox label="小节数" value="1 / 10" highlight />
        </div>

        {/* Section list header */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 fill-none stroke-[var(--foreground)]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            <span className="text-sm font-semibold text-[var(--foreground)]">小节列表</span>
          </div>
          <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            + 添加小节
          </button>
        </div>

        {/* Section 1 - active */}
        <div className="mt-4 flex flex-col gap-5 rounded-lg border-2 border-[var(--primary)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--foreground)]">小节 1</span>
              <span className="rounded-full bg-green-600/30 px-2 py-0.5 text-[11px] text-green-400">
                已编辑
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5,3 19,12 5,21 5,3" />
                </svg>
                从此播放
              </button>
              <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">×</button>
            </div>
          </div>

          {/* Frequency settings */}
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-[11px] text-[var(--muted-foreground)]">频率 A (起始)</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border border-[var(--input)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)]">
                  10ms (100Hz)
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)]">索引: 0</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-[11px] text-[var(--muted-foreground)]">频率 B (终止)</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border border-[var(--input)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)]">
                  40ms (25Hz)
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)]">索引: 30</span>
              </div>
            </div>
          </div>

          {/* Freq mode + duration */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[var(--muted-foreground)]">频率模式</span>
              <div className="flex gap-1">
                {["固定", "节内渐变", "元间隔变", "元间渐变"].map((mode, i) => (
                  <button
                    key={mode}
                    className={`rounded-md px-3 py-1.5 text-xs ${
                      i === 1
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[var(--muted-foreground)]">小节时长</span>
              <div className="flex items-center gap-2">
                <div className="rounded-md border border-[var(--input)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)]">
                  4.5s
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)]">索引: 4.4</span>
              </div>
            </div>
          </div>

          {/* Pulse visualization */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                ✨ 脉冲元形状 <span className="font-normal text-[var(--muted-foreground)]">0.8 s (8组脉冲)</span>
              </span>
              <div className="flex items-center gap-2">
                <button className="rounded-md border border-[var(--border)] p-1 text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">
                  −
                </button>
                <button className="rounded-md border border-[var(--border)] p-1 text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">
                  +
                </button>
              </div>
            </div>

            {/* Pulse bar editor */}
            <div className="flex items-end gap-1 rounded-lg bg-[var(--secondary)] p-4" style={{ height: 120 }}>
              {[10, 20, 35, 50, 65, 75, 85, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 cursor-ns-resize rounded-sm bg-[var(--primary)] transition-all hover:opacity-80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-[11px] text-[var(--muted-foreground)]">
              <span>■ 始小 (拖动边缘调节大小)</span>
              <span>◇ 改变消息</span>
              <span>● 选中</span>
            </div>
          </div>
        </div>

        {/* Section 2 - disabled */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 opacity-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">小节 2</span>
            <span className="text-xs text-[var(--muted-foreground)]">已禁用</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">此小节已禁用，开启后可编辑</span>
            <div className="h-5 w-9 rounded-full bg-[var(--secondary)]">
              <div className="h-5 w-5 rounded-full bg-[var(--muted-foreground)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`flex flex-1 flex-col gap-1 rounded-lg border p-4 ${
        highlight
          ? "border-[var(--primary)] bg-[var(--card)]"
          : "border-[var(--border)] bg-[var(--card)]"
      }`}
    >
      <span className="text-[11px] text-[var(--muted-foreground)]">{label}</span>
      <span className="text-lg font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}
