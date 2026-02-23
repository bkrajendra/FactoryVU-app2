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
  IonItemDivider,
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
    IonItemDivider,
  ],
})
export class Tab3Page implements OnInit {
  notificationSms$ = this.settings.notificationSms$;
  notificationEmail$ = this.settings.notificationEmail$;

  apiKeyInput = '';
  saveMessage = '';
  hasUnsavedChanges = false;

  tempUpper = 35;
  tempLower = 15;
  humidityUpper = 80;
  humidityLower = 30;
  updateIntervalInput = 5;
  thresholdMessage = '';
  hasUnsavedThresholds = false;

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.apiKeyInput = this.settings.apiKey;
    const thresholds = this.settings.thresholds;
    this.tempUpper = thresholds.tempUpper;
    this.tempLower = thresholds.tempLower;
    this.humidityUpper = thresholds.humidityUpper;
    this.humidityLower = thresholds.humidityLower;
    this.updateIntervalInput = this.settings.updateInterval;
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

  onThresholdChange() {
    const current = this.settings.thresholds;
    this.hasUnsavedThresholds =
      this.tempUpper !== current.tempUpper ||
      this.tempLower !== current.tempLower ||
      this.humidityUpper !== current.humidityUpper ||
      this.humidityLower !== current.humidityLower ||
      this.updateIntervalInput !== this.settings.updateInterval;
    this.thresholdMessage = '';
  }

  saveThresholds() {
    this.settings.setTempUpper(this.tempUpper);
    this.settings.setTempLower(this.tempLower);
    this.settings.setHumidityUpper(this.humidityUpper);
    this.settings.setHumidityLower(this.humidityLower);
    this.settings.setUpdateInterval(this.updateIntervalInput);
    this.hasUnsavedThresholds = false;
    this.thresholdMessage = 'Settings saved successfully';
    setTimeout(() => (this.thresholdMessage = ''), 3000);
  }
}
