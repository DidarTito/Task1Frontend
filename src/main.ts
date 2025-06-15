import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';

bootstrapApplication(AppComponent, appConfig
  // {providers: [provideHttpClient(withFetch())],}
  )
//appConfig
  .catch((err) => console.error(err));
