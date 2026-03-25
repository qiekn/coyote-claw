import { QRCodeSVG } from "qrcode.react";
import type { ConnectionStatus } from "../hooks/useWsServer";

interface Props {
  status: ConnectionStatus;
  qrcodeUrl: string;
}

export function ConnectionPanel({ status, qrcodeUrl }: Props) {
  if (status === "Paired") return null;

  return (
    <div className="flex flex-col items-center gap-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <span className="text-base font-semibold text-[var(--foreground)]">
        扫码连接
      </span>

      <div className="rounded-md bg-white p-2">
        {qrcodeUrl ? (
          <QRCodeSVG value={qrcodeUrl} size={168} />
        ) : (
          <div className="flex h-[168px] w-[168px] items-center justify-center text-sm text-gray-400">
            QR
          </div>
        )}
      </div>

      <span className="text-[13px] text-[var(--muted-foreground)]">
        打开 DG-LAB APP 扫描二维码
      </span>

      {qrcodeUrl && (
        <div className="flex items-center gap-1.5 rounded-md bg-[var(--secondary)] px-3 py-1.5">
          <svg className="h-3.5 w-3.5 fill-[var(--muted-foreground)]" viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
            {qrcodeUrl}
          </span>
        </div>
      )}
    </div>
  );
}
