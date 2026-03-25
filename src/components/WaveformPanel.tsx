interface Props {
  disabled: boolean;
  onSelect: (channel: string, waveform: string) => void;
  onClear: (channel: number) => void;
}

// 预设波形数据
const PRESETS: { name: string; data: string }[] = [
  {
    name: "呼吸",
    data: '["0A0A0A0A00142864","0A0A0A0A64281400"]',
  },
  {
    name: "潮汐",
    data: '["0A0A0A0A32326464","0A0A0A0A64643232","0A0A0A0A32326464","0A0A0A0A64643232"]',
  },
  {
    name: "心跳",
    data: '["0A0A0A0A64640000","0A0A0A0A00006464","0A0A0A0A00000000","0A0A0A0A00000000"]',
  },
  {
    name: "持续",
    data: '["0A0A0A0A64646464"]',
  },
];

export function WaveformPanel({ disabled, onSelect, onClear }: Props) {
  return (
    <div className="rounded-xl bg-gray-800 p-6">
      <h2 className="mb-4 text-center text-lg font-medium text-gray-300">
        波形
      </h2>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              disabled={disabled}
              onClick={() => {
                onSelect("A", preset.data);
                onSelect("B", preset.data);
              }}
              className="rounded bg-purple-700 px-3 py-2 text-sm text-white hover:bg-purple-600 disabled:opacity-40"
            >
              {preset.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            disabled={disabled}
            onClick={() => onClear(1)}
            className="flex-1 rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-500 disabled:opacity-40"
          >
            清空 A
          </button>
          <button
            disabled={disabled}
            onClick={() => onClear(2)}
            className="flex-1 rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-500 disabled:opacity-40"
          >
            清空 B
          </button>
        </div>
      </div>
    </div>
  );
}
