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
    // Enable verbose logging for debugging (remove or lower in production)
    OneSignal.Debug.setLogLevel(6);

    // Initialize with your OneSignal App ID
    OneSignal.initialize('df0fda53-9ba1-4cf1-89c1-a1f4c6a8934c');

    // Do NOT call Notifications.requestPermission directly here.
    // Instead, configure an In-App Message in the OneSignal dashboard that
    // shows a push-permission prompt, and trigger it from the app.

    // Example: trigger an IAM named with condition key `ask_push_permission`
    // which you configure in the OneSignal dashboard to include the permission prompt.
    OneSignal.InAppMessages.addTrigger('ask_push_permission', 'true');
  }
}
