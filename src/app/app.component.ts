import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import OneSignal from 'onesignal-cordova-plugin';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(6);
    // Initialize with your OneSignal App ID
    OneSignal.initialize('df0fda53-9ba1-4cf1-89c1-a1f4c6a8934c');
    // Use this method to prompt for push notifications.
    // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
    OneSignal.Notifications.requestPermission(false).then(
      (accepted: boolean) => {
        console.log('User accepted notifications: ' + accepted);
      }
    );
  }
}
