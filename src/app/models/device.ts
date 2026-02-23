/** Cloud API device payload: deviceId -> sensor data */
export interface CloudDeviceData {
  humidity?: { time: number; value: number; processList: string };
  temp?: { time: number; value: number; processList: string };
}

export type CloudDevicesMap = Record<string, CloudDeviceData>;

/** Unified device shown in the app (cloud + optional mDNS) */
export interface UnifiedDevice {
  id: string;
  name: string;
  temp: number | null;
  humidity: number | null;
  lastSeen: number | null;
  source: 'cloud' | 'mdns' | 'both';
  /** Local address when discovered via mDNS (e.g. 192.168.1.10:80) */
  localAddress?: string;
}
