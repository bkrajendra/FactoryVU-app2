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
  thermometerOutline,
  waterOutline,
  arrowBackOutline,
  chevronBackOutline,
  chevronForwardOutline,
  analyticsOutline,
  timeOutline,
  cloudOutline,
  serverOutline,
  syncOutline,
  searchOutline,
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

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
  'thermometer-outline': thermometerOutline,
  'water-outline': waterOutline,
  'arrow-back-outline': arrowBackOutline,
  'chevron-back-outline': chevronBackOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'analytics-outline': analyticsOutline,
  'time-outline': timeOutline,
  'cloud-outline': cloudOutline,
  'server-outline': serverOutline,
  'sync-outline': syncOutline,
  'search-outline': searchOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
});
