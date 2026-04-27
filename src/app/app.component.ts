import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import OneSignal from 'onesignal-cordova-plugin';
import { Capacitor } from '@capacitor/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { AlertController } from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private swUpdate = inject(SwUpdate);
  private alertCtrl = inject(AlertController);

  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.initNativeOneSignal();
    } else {
      this.initWebOneSignal();
      this.listenForPwaUpdates();
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

    // On iOS, notifications won't arrive until the user grants permission.
    // If you rely on an In-App Message prompt, ensure it is configured in OneSignal.
    // This call is safe to make; iOS will only prompt when appropriate.
    OneSignal.Notifications.requestPermission(true);

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
    w.OneSignalDeferred = w.OneSignalDeferred || [];

    // Use the v16 Web SDK deferred initialization API
    w.OneSignalDeferred.push(async (OneSignal: any) => {
      await OneSignal.init({
        appId: 'df0fda53-9ba1-4cf1-89c1-a1f4c6a8934c',
        allowLocalhostAsSecureOrigin: true,
      });

      // Trigger the same IAM-based permission flow on web.
      OneSignal.InAppMessages.addTrigger('ask_push_permission', 'true');
    });
  }

  /**
   * Listen for Angular Service Worker version updates and prompt the user
   * to reload when a new version is ready (web/PWA only).
   */
  private listenForPwaUpdates() {
    if (!('serviceWorker' in navigator) || !this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(async () => {
        const alert = await this.alertCtrl.create({
          header: 'Update available',
          message: 'A new version of FactoryVU is available.',
          buttons: [
            { text: 'Later', role: 'cancel' },
            {
              text: 'Reload',
              handler: () => {
                this.swUpdate.activateUpdate().then(() => document.location.reload());
              },
            },
          ],
        });
        await alert.present();
      });
  }
}
