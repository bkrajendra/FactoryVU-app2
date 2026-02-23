import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const KEY_SMS = 'factoryvu_notify_sms';
const KEY_EMAIL = 'factoryvu_notify_email';
const KEY_API_KEY = 'factoryvu_scare_api_key';
const KEY_TEMP_UPPER = 'factoryvu_temp_upper';
const KEY_TEMP_LOWER = 'factoryvu_temp_lower';
const KEY_HUMIDITY_UPPER = 'factoryvu_humidity_upper';
const KEY_HUMIDITY_LOWER = 'factoryvu_humidity_lower';
const KEY_UPDATE_INTERVAL = 'factoryvu_update_interval';

export interface ThresholdSettings {
  tempUpper: number;
  tempLower: number;
  humidityUpper: number;
  humidityLower: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _sms = new BehaviorSubject<boolean>(this.getBool(KEY_SMS, true));
  private _email = new BehaviorSubject<boolean>(this.getBool(KEY_EMAIL, true));
  private _apiKey = new BehaviorSubject<string>(localStorage.getItem(KEY_API_KEY) ?? '');

  private _tempUpper = new BehaviorSubject<number>(this.getNumber(KEY_TEMP_UPPER, 35));
  private _tempLower = new BehaviorSubject<number>(this.getNumber(KEY_TEMP_LOWER, 15));
  private _humidityUpper = new BehaviorSubject<number>(this.getNumber(KEY_HUMIDITY_UPPER, 80));
  private _humidityLower = new BehaviorSubject<number>(this.getNumber(KEY_HUMIDITY_LOWER, 30));
  private _updateInterval = new BehaviorSubject<number>(this.getNumber(KEY_UPDATE_INTERVAL, 5));

  notificationSms$ = this._sms.asObservable();
  notificationEmail$ = this._email.asObservable();
  apiKey$ = this._apiKey.asObservable();

  tempUpper$ = this._tempUpper.asObservable();
  tempLower$ = this._tempLower.asObservable();
  humidityUpper$ = this._humidityUpper.asObservable();
  humidityLower$ = this._humidityLower.asObservable();
  updateInterval$ = this._updateInterval.asObservable();

  private getBool(key: string, defaultVal: boolean): boolean {
    const v = localStorage.getItem(key);
    if (v === null) return defaultVal;
    return v === 'true';
  }

  private getNumber(key: string, defaultVal: number): number {
    const v = localStorage.getItem(key);
    if (v === null) return defaultVal;
    const parsed = parseFloat(v);
    return isNaN(parsed) ? defaultVal : parsed;
  }

  setNotificationSms(enabled: boolean) {
    localStorage.setItem(KEY_SMS, String(enabled));
    this._sms.next(enabled);
  }

  setNotificationEmail(enabled: boolean) {
    localStorage.setItem(KEY_EMAIL, String(enabled));
    this._email.next(enabled);
  }

  get notificationSms(): boolean {
    return this._sms.getValue();
  }

  get notificationEmail(): boolean {
    return this._email.getValue();
  }

  setApiKey(key: string) {
    const value = (key ?? '').trim();
    localStorage.setItem(KEY_API_KEY, value);
    this._apiKey.next(value);
  }

  get apiKey(): string {
    return this._apiKey.getValue();
  }

  setTempUpper(value: number) {
    localStorage.setItem(KEY_TEMP_UPPER, String(value));
    this._tempUpper.next(value);
  }

  setTempLower(value: number) {
    localStorage.setItem(KEY_TEMP_LOWER, String(value));
    this._tempLower.next(value);
  }

  setHumidityUpper(value: number) {
    localStorage.setItem(KEY_HUMIDITY_UPPER, String(value));
    this._humidityUpper.next(value);
  }

  setHumidityLower(value: number) {
    localStorage.setItem(KEY_HUMIDITY_LOWER, String(value));
    this._humidityLower.next(value);
  }

  get thresholds(): ThresholdSettings {
    return {
      tempUpper: this._tempUpper.getValue(),
      tempLower: this._tempLower.getValue(),
      humidityUpper: this._humidityUpper.getValue(),
      humidityLower: this._humidityLower.getValue(),
    };
  }

  setUpdateInterval(value: number) {
    const interval = Math.max(1, value);
    localStorage.setItem(KEY_UPDATE_INTERVAL, String(interval));
    this._updateInterval.next(interval);
  }

  get updateInterval(): number {
    return this._updateInterval.getValue();
  }
}
