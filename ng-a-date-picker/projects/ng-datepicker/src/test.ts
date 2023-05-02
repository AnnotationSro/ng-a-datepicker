/* eslint-disable */
// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import {getTestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {registerLocaleData} from "@angular/common";
// Add these two imports
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import localeSk from '@angular/common/locales/sk';
import localeSkExtra from '@angular/common/locales/extra/sk';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
});

// // Add this line to register a locale (german in this case).
registerLocaleData(localeEn, localeEnExtra);
registerLocaleData(localeDe, localeDeExtra);
registerLocaleData(localeSk, localeSkExtra);
