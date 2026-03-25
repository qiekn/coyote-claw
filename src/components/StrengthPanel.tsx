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
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-gray-400">
        通道 {label} (上限 {limit})
      </span>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="flex gap-2">
        <button
          disabled={disabled}
          onClick={() => onStrength(channel, 0, 1)}
          className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-500 disabled:opacity-40"
        >
          -
        </button>
        <button
          disabled={disabled}
          onClick={() => onStrength(channel, 1, 1)}
          className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-500 disabled:opacity-40"
        >
          +
        </button>
        <button
          disabled={disabled}
          onClick={() => onStrength(channel, 2, 0)}
          className="rounded bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-40"
        >
          归零
        </button>
      </div>
    </div>
  );
}

export function StrengthPanel({ strength, disabled, onStrength }: Props) {
  return (
    <div className="rounded-xl bg-gray-800 p-6">
      <h2 className="mb-4 text-center text-lg font-medium text-gray-300">
        强度控制
      </h2>
      <div className="flex justify-around gap-8">
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
    </div>
  );
}
