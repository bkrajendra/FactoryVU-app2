

### OneSignal Setup
https://documentation.onesignal.com/docs/en/ionic-capacitor-cordova-sdk-setup#step-by-step-instructions-for-configuring-your-onesignal-app

npm install onesignal-cordova-plugin
npx cap sync

rm -rf ios
npx cap add ios --packagemanager CocoaPods
npx cap sync ios

npx cap sync ios
npx cap open ios