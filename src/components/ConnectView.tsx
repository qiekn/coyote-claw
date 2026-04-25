import { QRCodeSVG } from "qrcode.react";
import type { ConnectionStatus } from "../hooks/useWsServer";

interface Props {
  qrcodeUrl: string;
  status: ConnectionStatus;
}

export function ConnectView({ qrcodeUrl, status }: Props) {
  const onCopy = async () => {
    if (!qrcodeUrl) return;
    try {
      await navigator.clipboard.writeText(qrcodeUrl);
    } catch {
      // ignore
    }
  };

  const statusLabel: Record<ConnectionStatus, string> = {
    Disconnected: "等待 APP 扫码",
    WaitingForApp: "等待 APP 扫码",
    AppConnected: "APP 已连接，绑定中…",
    Paired: "APP 已绑定",
  };

  return (
    <main className="flex w-full flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 md:p-8">
        <div className="mb-8 border-b border-gray-800 pb-4 text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-wider text-white">DEVICE CONNECTION</h2>
          <p className="mt-1 text-sm text-gray-400">
            使用手机 DG-LAB APP 扫描下方二维码接入此本地控制服务
          </p>
        </div>

        <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8 shadow-inner">
            <h3 className="font-digital z-10 mb-6 text-xl font-bold tracking-widest text-cyan-500">
              LOCAL WS SERVER
            </h3>
            <div className="relative z-10 flex h-64 w-64 items-center justify-center rounded-xl border border-cyan-500/50 bg-white p-4 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-transform duration-300 hover:scale-105 md:h-80 md:w-80">
              {qrcodeUrl ? (
                <QRCodeSVG value={qrcodeUrl} size={256} className="h-full w-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                  正在生成…
                </div>
              )}
              <div className="absolute -translate-x-2 -translate-y-2 top-0 left-0 h-8 w-8 rounded-tl-lg border-t-4 border-l-4 border-cyan-500" />
              <div className="absolute -translate-y-2 translate-x-2 top-0 right-0 h-8 w-8 rounded-tr-lg border-t-4 border-r-4 border-cyan-500" />
              <div className="absolute -translate-x-2 translate-y-2 bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-cyan-500" />
              <div className="absolute translate-x-2 translate-y-2 bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-cyan-500" />
            </div>
            <div className="z-10 mt-8 text-center">
              <p className="mb-3 text-sm font-bold tracking-widest text-gray-400">
                使用 APP 扫码建立连接
              </p>
              <button
                onClick={onCopy}
                title="点击复制地址"
                className="group inline-flex items-center gap-3 rounded-lg border border-gray-700 bg-black/50 px-4 py-2 transition-colors hover:border-cyan-500/50"
              >
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="font-digital text-sm tracking-wider text-cyan-400 md:text-base">
                  {qrcodeUrl || "—"}
                </span>
                <svg
                  className="h-4 w-4 text-gray-500 transition-colors group-hover:text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-1 flex-col rounded-3xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="font-digital text-lg font-bold tracking-wide text-gray-300">
                  CONNECTION STATUS
                </h3>
                {status !== "Paired" && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-r-transparent border-l-transparent" />
                )}
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <div className="font-digital text-2xl tracking-widest text-white">
                  {statusLabel[status]}
                </div>
                <p className="text-xs text-gray-500">
                  {status === "Paired"
                    ? "你可以切换到 DASHBOARD 进行控制"
                    : "请打开 DG-LAB APP → 选择 SOCKET 连接 → 扫码"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="mb-3 text-sm font-bold tracking-widest text-gray-400 uppercase">
                Manual Connect
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="（暂未实现）"
                  disabled
                  className="font-digital flex-1 rounded-lg border border-gray-700 bg-black/50 px-4 py-3 text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none disabled:cursor-not-allowed"
                />
                <button
                  disabled
                  className="rounded-lg bg-gray-700 px-6 py-3 font-bold transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  接入
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
