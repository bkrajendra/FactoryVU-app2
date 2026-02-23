import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonButtons } from '@ionic/angular/standalone';
import { MdnsDevice } from 'capacitor-mdns-discovery';
import { DiscoveryService } from '../services/discovery';
import { CloudDevicesService } from '../services/cloud-devices.service';
import { UnifiedDevice } from '../models/device';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonButtons,
  ],
})
export class Tab2Page implements OnInit, OnDestroy {
  devices: UnifiedDevice[] = [];
  loading = false;
  scanning = false;
  error: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private cloud: CloudDevicesService,
    private discovery: DiscoveryService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cloud.loadFromCloud();

    this.subs.push(
      this.cloud.loading$.subscribe((l: boolean) => (this.loading = l)),
      this.cloud.error$.subscribe((e: string | null) => (this.error = e)),
      this.discovery.scanning$.subscribe(s => (this.scanning = s)),
      combineLatest([this.cloud.cloudDevices$, this.discovery.devices$]).subscribe(([cloudList, mdnsList]: [UnifiedDevice[], MdnsDevice[]]) => {
        this.devices = this.mergeDevices(cloudList, mdnsList ?? []);
        this.cloud.setMergedDevices(this.devices);
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.discovery.stopDiscovery();
  }

  /** Derive device id from mDNS device (txtRecords or name) */
  private mdnsDeviceId(d: MdnsDevice): string {
    const id = d.txtRecords?.['id'] ?? d.txtRecords?.['device_id'] ?? d.txtRecords?.['chip_id'];
    if (id) return String(id).trim();
    return d.name || `${d.host}:${d.port}`;
  }

  private mergeDevices(cloudList: UnifiedDevice[], mdnsList: MdnsDevice[]): UnifiedDevice[] {
    const byId = new Map<string, UnifiedDevice>();
    for (const d of cloudList) {
      byId.set(d.id, { ...d });
    }
    for (const m of mdnsList) {
      const id = this.mdnsDeviceId(m);
      const localAddr = `${m.host}:${m.port}`;
      const existing = byId.get(id);
      if (existing) {
        existing.source = 'both';
        existing.localAddress = localAddr;
        existing.name = existing.name || m.name;
      } else {
        byId.set(id, {
          id,
          name: m.name,
          temp: null,
          humidity: null,
          lastSeen: null,
          source: 'mdns',
          localAddress: localAddr,
        });
      }
    }
    return Array.from(byId.values());
  }

  async toggleScan() {
    if (this.scanning) {
      await this.discovery.stopDiscovery();
    } else {
      this.discovery.clearDevices();
      await this.discovery.startDiscovery(['_http._tcp', '_esp._tcp']);
    }
  }

  refreshCloud() {
    this.cloud.loadFromCloud();
  }

  formatLastSeen(ts: number | null): string {
    if (ts == null) return '—';
    const d = new Date(ts * 1000);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 60000;
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  }

  trackById(_: number, d: UnifiedDevice) {
    return d.id;
  }

  goToDevice(device: UnifiedDevice) {
    this.router.navigate(['/device', device.id]);
  }
}
