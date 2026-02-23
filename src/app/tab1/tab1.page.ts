import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { CloudDevicesService } from '../services/cloud-devices.service';
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
  user$ = this.auth.user$;
  counts = { total: 0, active: 0, inactive: 0 };
  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private cloud: CloudDevicesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cloud.loadFromCloud();
    this.subs.push(
      this.cloud.devices$.subscribe(() => {
        this.counts = this.cloud.getCounts();
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  goToDevices() {
    this.router.navigate(['/tabs/tab2']);
  }

  login() {
    this.auth.login('Guest User', 'guest@example.com');
  }

  logout() {
    this.auth.logout();
  }
}
