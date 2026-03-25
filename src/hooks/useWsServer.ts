import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState, useCallback } from "react";

export type ConnectionStatus =
  | "Disconnected"
  | "WaitingForApp"
  | "AppConnected"
  | "Paired";

export interface StrengthData {
  a: number;
  b: number;
  aLimit: number;
  bLimit: number;
}

export function useWsServer() {
  const [status, setStatus] = useState<ConnectionStatus>("Disconnected");
  const [qrcodeUrl, setQrcodeUrl] = useState("");
  const [strength, setStrength] = useState<StrengthData>({
    a: 0,
    b: 0,
    aLimit: 200,
    bLimit: 200,
  });

  useEffect(() => {
    invoke<string>("get_qrcode_url").then(setQrcodeUrl);

    const unlistenStatus = listen<ConnectionStatus>(
      "ws:connection-status",
      (e) => setStatus(e.payload),
    );

    const unlistenStrength = listen<StrengthData>(
      "ws:strength-update",
      (e) => setStrength(e.payload),
    );

    return () => {
      unlistenStatus.then((f) => f());
      unlistenStrength.then((f) => f());
    };
  }, []);

  const sendStrength = useCallback(
    async (channel: number, mode: number, value: number) => {
      await invoke("send_strength", { channel, mode, value });
    },
    [],
  );

  const sendWaveform = useCallback(
    async (channel: string, waveform: string) => {
      await invoke("send_waveform", { channel, waveform });
    },
    [],
  );

  const clearWaveform = useCallback(async (channel: number) => {
    await invoke("clear_waveform", { channel });
  }, []);

  return {
    status,
    qrcodeUrl,
    strength,
    sendStrength,
    sendWaveform,
    clearWaveform,
  };
}
