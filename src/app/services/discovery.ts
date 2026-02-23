// src/app/services/discovery.service.ts
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MdnsDiscovery, MdnsDevice } from 'capacitor-mdns-discovery';

@Injectable({ providedIn: 'root' })
export class DiscoveryService {
  private devicesMap = new Map<string, MdnsDevice>();

  private _devices = new BehaviorSubject<MdnsDevice[]>([]);
  public devices$ = this._devices.asObservable();

  private _scanning = new BehaviorSubject(false);
  public scanning$ = this._scanning.asObservable();

  private _error = new BehaviorSubject<string | null>(null);
  public error$ = this._error.asObservable();

  // Track plugin event listeners so we can remove them
  private listeners: Array<{ remove: () => void }> = [];

  constructor(private zone: NgZone) {}

  // ── Start discovery ──────────────────────────────────────────────────────

  async startDiscovery(serviceTypes = ['_http._tcp', '_esp._tcp']) {
    this._scanning.next(true);
    this._error.next(null);

    // Register event listeners
    const foundListener = await MdnsDiscovery.addListener('deviceFound', (device: any) => {
      this.zone.run(() => {
        // Use name+serviceType as unique key
        const key = `${device.name}:${device.serviceType}`;
        this.devicesMap.set(key, device);
        this._devices.next(Array.from(this.devicesMap.values()));
      });
    });

    const lostListener = await MdnsDiscovery.addListener('deviceLost', ({ name, serviceType }) => {
      this.zone.run(() => {
        const key = `${name}:${serviceType}`;
        this.devicesMap.delete(key);
        this._devices.next(Array.from(this.devicesMap.values()));
      });
    });

    const errorListener = await MdnsDiscovery.addListener('discoveryError', ({ message }) => {
      this.zone.run(() => this._error.next(message));
    });

    this.listeners.push(foundListener, lostListener, errorListener);

    // Start discovery for each service type
    for (const serviceType of serviceTypes) {
      try {
        await MdnsDiscovery.startDiscovery({ serviceType });
      } catch (e: any) {
        this._error.next(e?.message ?? 'Unknown error');
      }
    }
  }

  // ── Stop discovery ───────────────────────────────────────────────────────

  async stopDiscovery(serviceTypes = ['_http._tcp', '_esp._tcp']) {
    for (const serviceType of serviceTypes) {
      await MdnsDiscovery.stopDiscovery({ serviceType }).catch(() => {});
    }

    // Remove all event listeners
    this.listeners.forEach(l => l.remove());
    this.listeners = [];

    this._scanning.next(false);
  }

  clearDevices() {
    this.devicesMap.clear();
    this._devices.next([]);
  }
}