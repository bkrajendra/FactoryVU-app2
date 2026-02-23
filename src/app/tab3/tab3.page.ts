import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonToggle, IonIcon, IonInput } from '@ionic/angular/standalone';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
    IonInput,
  ],
})
export class Tab3Page {
  notificationSms$ = this.settings.notificationSms$;
  notificationEmail$ = this.settings.notificationEmail$;
  apiKey$ = this.settings.apiKey$;

  constructor(private settings: SettingsService) {}

  setApiKey(value: string) {
    this.settings.setApiKey(value ?? '');
  }

  setSms(enabled: boolean) {
    this.settings.setNotificationSms(enabled);
  }

  setEmail(enabled: boolean) {
    this.settings.setNotificationEmail(enabled);
  }
}
