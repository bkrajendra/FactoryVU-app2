import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonInput,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
    IonInput,
    IonButton,
    IonText,
  ],
})
export class Tab3Page implements OnInit {
  notificationSms$ = this.settings.notificationSms$;
  notificationEmail$ = this.settings.notificationEmail$;

  apiKeyInput = '';
  saveMessage = '';
  hasUnsavedChanges = false;

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.apiKeyInput = this.settings.apiKey;
  }

  onApiKeyInput(value: string) {
    this.apiKeyInput = value ?? '';
    this.hasUnsavedChanges = this.apiKeyInput !== this.settings.apiKey;
    this.saveMessage = '';
  }

  saveApiKey() {
    this.settings.setApiKey(this.apiKeyInput);
    this.hasUnsavedChanges = false;
    this.saveMessage = 'API key saved successfully';
    setTimeout(() => (this.saveMessage = ''), 3000);
  }

  setSms(enabled: boolean) {
    this.settings.setNotificationSms(enabled);
  }

  setEmail(enabled: boolean) {
    this.settings.setNotificationEmail(enabled);
  }
}
