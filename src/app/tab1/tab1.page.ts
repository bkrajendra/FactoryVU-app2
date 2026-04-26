import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CloudDevicesService } from '../services/cloud-devices.service';
import { SettingsService } from '../services/settings.service';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
  ],
})
export class Tab1Page {
  counts = { total: 0, active: 0, inactive: 0 };
  appVersion = environment.version;
  hasApiKey = false;
  private subs: Subscription[] = [];

  constructor(
    private cloud: CloudDevicesService,
    private settings: SettingsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.subs.push(
      this.settings.apiKey$.subscribe((k: string) => {
        this.hasApiKey = !!(k ?? '').trim();
      }),
      // Home should populate System Info even before visiting Devices tab.
      // Devices tab later overwrites merged devices when it merges mDNS + cloud.
      this.cloud.cloudDevices$.subscribe((list) => {
        this.cloud.setMergedDevices(list);
        this.counts = this.cloud.getCounts();
      }),
    );
  }

  ionViewWillEnter() {
    // Refresh whenever the Home tab becomes visible.
    this.cloud.loadFromCloud();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  goToDevices() {
    this.router.navigate(['/tabs/tab2']);
  }

  goToSettings() {
    this.router.navigate(['/tabs/tab3']);
  }
}
