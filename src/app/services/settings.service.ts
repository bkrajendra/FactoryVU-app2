import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const KEY_SMS = 'factoryvu_notify_sms';
const KEY_EMAIL = 'factoryvu_notify_email';
const KEY_API_KEY = 'factoryvu_scare_api_key';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _sms = new BehaviorSubject<boolean>(this.getBool(KEY_SMS, true));
  private _email = new BehaviorSubject<boolean>(this.getBool(KEY_EMAIL, true));
  private _apiKey = new BehaviorSubject<string>(localStorage.getItem(KEY_API_KEY) ?? '');

  notificationSms$ = this._sms.asObservable();
  notificationEmail$ = this._email.asObservable();
  apiKey$ = this._apiKey.asObservable();

  private getBool(key: string, defaultVal: boolean): boolean {
    const v = localStorage.getItem(key);
    if (v === null) return defaultVal;
    return v === 'true';
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
}
