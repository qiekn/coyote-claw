import { QRCodeSVG } from "qrcode.react";
import type { ConnectionStatus } from "../hooks/useWsServer";

interface Props {
  status: ConnectionStatus;
  qrcodeUrl: string;
}

const STATUS_TEXT: Record<ConnectionStatus, string> = {
  Disconnected: "未连接",
  WaitingForApp: "等待 APP 扫码",
  Paired: "已配对",
};

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  Disconnected: "text-red-400",
  WaitingForApp: "text-yellow-400",
  Paired: "text-green-400",
};

export function ConnectionPanel({ status, qrcodeUrl }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-gray-800 p-6">
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            status === "Paired"
              ? "bg-green-400"
              : status === "WaitingForApp"
                ? "bg-yellow-400"
                : "bg-red-400"
          }`}
        />
        <span className={`text-lg font-medium ${STATUS_COLOR[status]}`}>
          {STATUS_TEXT[status]}
        </span>
      </div>

      {status !== "Paired" && qrcodeUrl && (
        <div className="rounded-lg bg-white p-3">
          <QRCodeSVG value={qrcodeUrl} size={200} />
        </div>
      )}

      {status !== "Paired" && (
        <p className="text-center text-sm text-gray-400">
          打开 DG-LAB APP 扫描二维码连接
        </p>
      )}
    </div>
  );
}
