import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import OneSignal from 'onesignal-cordova-plugin';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.initNativeOneSignal();
    } else {
      this.initWebOneSignal();
    }
  }

  /**
   * Native (Android / iOS via Capacitor + Cordova plugin)
   */
  private initNativeOneSignal() {
    // Enable verbose logging for debugging (remove or lower in production)
    OneSignal.Debug.setLogLevel(6);

    // Initialize with your OneSignal App ID
    OneSignal.initialize('df0fda53-9ba1-4cf1-89c1-a1f4c6a8934c');

    // Use an In-App Message configured in the OneSignal dashboard
    // to show the native push permission prompt.
    OneSignal.InAppMessages.addTrigger('ask_push_permission', 'true');
  }

  /**
   * Web / PWA (OneSignal Web SDK via global window.OneSignal)
   */
  private initWebOneSignal() {
    if (typeof window === 'undefined') {
      return;
    }
    const w = window as any;
    const oneSignal = w.OneSignal || [];
    w.OneSignal = oneSignal;

    oneSignal.push(() => {
      oneSignal.init({
        appId: 'df0fda53-9ba1-4cf1-89c1-a1f4c6a8934c',
        allowLocalhostAsSecureOrigin: true,
      });

      // Trigger the same IAM-based permission flow on web.
      oneSignal.InAppMessages.addTrigger('ask_push_permission', 'true');
    });
  }
}
