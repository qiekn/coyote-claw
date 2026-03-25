import type { StrengthData } from "../hooks/useWsServer";

interface Props {
  strength: StrengthData;
  disabled: boolean;
  onStrength: (channel: number, mode: number, value: number) => void;
}

function ChannelControl({
  label,
  value,
  limit,
  channel,
  disabled,
  onStrength,
}: {
  label: string;
  value: number;
  limit: number;
  channel: number;
  disabled: boolean;
  onStrength: (channel: number, mode: number, value: number) => void;
}) {
  const pct = limit > 0 ? Math.min((value / limit) * 100, 100) : 0;

  return (
    <div className="flex flex-1 flex-col items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
        通道 {label}
      </div>

      <span className="text-5xl font-bold text-[var(--foreground)]">{value}</span>

      <span className="text-sm text-[var(--muted-foreground)]">/ {limit}</span>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-[var(--secondary)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex w-full gap-2">
        <button
          disabled={disabled}
          onClick={() => onStrength(channel, 0, 1)}
          className="flex flex-1 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--secondary)] py-2 text-lg text-[var(--foreground)] hover:bg-[var(--accent)] disabled:opacity-40"
        >
          −
        </button>
        <button
          disabled={disabled}
          onClick={() => onStrength(channel, 1, 1)}
          className="flex flex-1 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--secondary)] py-2 text-lg text-[var(--foreground)] hover:bg-[var(--accent)] disabled:opacity-40"
        >
          +
        </button>
        <button
          disabled={disabled}
          onClick={() => onStrength(channel, 2, 0)}
          className="flex flex-1 items-center justify-center rounded-md bg-transparent py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--secondary)] disabled:opacity-40"
        >
          归零
        </button>
      </div>
    </div>
  );
}

export function StrengthPanel({ strength, disabled, onStrength }: Props) {
  return (
    <div className="flex gap-4">
      <ChannelControl
        label="A"
        value={strength.a}
        limit={strength.aLimit}
        channel={1}
        disabled={disabled}
        onStrength={onStrength}
      />
      <ChannelControl
        label="B"
        value={strength.b}
        limit={strength.bLimit}
        channel={2}
        disabled={disabled}
        onStrength={onStrength}
      />
    </div>
  );
}
