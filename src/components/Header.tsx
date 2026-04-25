import type { View } from "../App";
import type { ConnectionStatus } from "../hooks/useWsServer";

interface Props {
  view: View;
  onViewChange: (v: View) => void;
  status: ConnectionStatus;
}

const TABS: { id: View; label: string }[] = [
  { id: "connect", label: "CONNECT" },
  { id: "dashboard", label: "DASHBOARD" },
  { id: "waveforms", label: "WAVEFORMS" },
];

export function Header({ view, onViewChange, status }: Props) {
  const dotColor =
    status === "Paired"
      ? "bg-emerald-500 shadow-[0_0_10px_#10b981]"
      : status === "AppConnected"
        ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]"
        : status === "WaitingForApp"
          ? "bg-yellow-500 shadow-[0_0_10px_#eab308]"
          : "bg-red-500 shadow-[0_0_10px_#ef4444]";

  const statusText: Record<ConnectionStatus, string> = {
    Disconnected: "OFFLINE",
    WaitingForApp: "WAITING",
    AppConnected: "BINDING",
    Paired: "ONLINE",
  };

  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-black/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex w-1/4 items-center gap-3 md:w-1/3">
        <div className={`h-3 w-3 animate-pulse rounded-full ${dotColor}`} />
        <h1 className="font-digital hidden text-xl font-bold tracking-widest text-gray-300 uppercase sm:block">
          COYOTE CLAW
        </h1>
      </div>

      <div className="font-digital flex w-auto justify-center rounded-lg border border-gray-700 bg-gray-900/80 p-1 text-xs shadow-xl md:text-sm">
        {TABS.map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`rounded px-3 py-1.5 tracking-wider transition-all md:px-4 ${
                active
                  ? "bg-gray-700 font-bold text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex w-1/4 justify-end md:w-1/3">
        <div className="font-digital rounded border border-gray-800 bg-black/50 px-3 py-1 text-sm text-gray-500">
          {statusText[status]}
        </div>
      </div>
    </header>
  );
}
