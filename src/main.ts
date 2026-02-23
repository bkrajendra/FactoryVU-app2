import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  keyOutline,
  saveOutline,
  chatbubbleOutline,
  mailOutline,
  homeOutline,
  hardwareChipOutline,
  settingsOutline,
  refreshOutline,
  warningOutline,
  hourglassOutline,
  cubeOutline,
  stopCircle,
  wifiOutline,
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

addIcons({
  'key-outline': keyOutline,
  'save-outline': saveOutline,
  'chatbubble-outline': chatbubbleOutline,
  'mail-outline': mailOutline,
  'home-outline': homeOutline,
  'hardware-chip-outline': hardwareChipOutline,
  'settings-outline': settingsOutline,
  'refresh-outline': refreshOutline,
  'warning-outline': warningOutline,
  'hourglass-outline': hourglassOutline,
  'cube-outline': cubeOutline,
  'stop-circle': stopCircle,
  'wifi-outline': wifiOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
