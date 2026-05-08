import { bootstrapApplication } from '@angular/platform-browser';
import 'bootstrap/js/dist/collapse';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
