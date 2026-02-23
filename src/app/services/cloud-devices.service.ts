import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import type { CloudDevicesMap, UnifiedDevice } from '../models/device';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class CloudDevicesService {
  private _devices = new BehaviorSubject<UnifiedDevice[]>([]);
  private _loading = new BehaviorSubject(false);
  private _error = new BehaviorSubject<string | null>(null);

  devices$ = this._devices.asObservable();
  loading$ = this._loading.asObservable();
  error$ = this._error.asObservable();

  /** Active = last data within last 15 minutes */
  private readonly ACTIVE_THRESHOLD_MS = 15 * 60 * 1000;

  constructor(private settings: SettingsService) {}

  loadFromCloud() {
    const apiKey = this.settings.apiKey;
    if (!apiKey) {
      this._error.next('Please set your API key in Settings');
      return;
    }
    this._loading.next(true);
    this._error.next(null);
    const url = `${environment.cloudApiUrl}?apikey=${encodeURIComponent(apiKey)}`;

    fetch(url)
      .then(res => res.json())
      .then((data: CloudDevicesMap) => {
        const list = this.cloudMapToUnifiedList(data);
        this._devices.next(list);
        this._loading.next(false);
      })
      .catch(err => {
        this._error.next(err?.message ?? 'Failed to load devices');
        this._loading.next(false);
      });
  }

  /** Convert API response map to UnifiedDevice[] */
  cloudMapToUnifiedList(map: CloudDevicesMap): UnifiedDevice[] {
    return Object.entries(map).map(([id, d]) => ({
      id,
      name: id,
      temp: d.temp?.value ?? null,
      humidity: d.humidity?.value ?? null,
      lastSeen: d.temp?.time ?? d.humidity?.time ?? null,
      source: 'cloud' as const,
    }));
  }

  getCounts(): { total: number; active: number; inactive: number } {
    const list = this._devices.getValue();
    const now = Math.floor(Date.now() / 1000);
    const threshold = now - this.ACTIVE_THRESHOLD_MS / 1000;
    let active = 0;
    for (const d of list) {
      if (d.lastSeen != null && d.lastSeen >= threshold) active++;
    }
    return {
      total: list.length,
      active,
      inactive: list.length - active,
    };
  }

  getDevicesSnapshot(): UnifiedDevice[] {
    return this._devices.getValue();
  }

  setMergedDevices(devices: UnifiedDevice[]) {
    this._devices.next(devices);
  }
}
