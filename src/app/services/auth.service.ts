import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  name: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'factoryvu_user';
  private _user = new BehaviorSubject<User | null>(this.loadStoredUser());
  user$ = this._user.asObservable();

  get isLoggedIn(): boolean {
    return this._user.getValue() != null;
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  login(name: string, email?: string) {
    const user: User = { name, email };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this._user.next(user);
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this._user.next(null);
  }
}
