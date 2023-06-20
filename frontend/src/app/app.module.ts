import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; /**FormsModule is the standard Angular directive for two-way data binding */

import { AppComponent } from './app.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DeplacementComponent } from './deplacement/deplacement.component';
import { ConfigDetailComponent } from './config-detail/config-detail.component';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { StopComponent } from './stop/stop.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; /**HttpClientModule is the module that includes the HttpClient service */
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import {ConfirmDialogService} from './confirm-dialog/confirm-dialog.service'; 
import { CommonModule } from '@angular/common';
import { DefaultConfComponent } from './default-conf/default-conf.component';
import { ReceipeComponent } from './receipe/receipe.component';
import { ReceipeListComponent } from './receipe-list/receipe-list.component';
import { ReceipeDetailsComponent } from './receipe-details/receipe-details.component';
import { RecordloopComponent } from './recordloop/recordloop.component';
import { GcodeComponent } from './gcode/gcode.component';
import { BarComponent } from './bar/bar.component';
import { VoidComponent } from './void/void.component';
/*import { DefaultConfComponent } from './default-conf/default-conf.component';*/

/*import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api'; /**The HttpClientInMemoryWebApiModule module intercepts HTTP requests and returns simulated server responses. Remove it when a real server is ready to receive requests. 
import { InMemoryDataService } from './in-memory-data.service'; /**The InMemoryDataService class replaces the mock config.ts file for the tutorial. */

@NgModule({
  declarations: [
    AppComponent,
    ConfigurationComponent,
    DeplacementComponent,
    ConfigDetailComponent,
    StopComponent,
    ConfirmDialogComponent,
    DefaultConfComponent,
    ReceipeComponent,
    ReceipeListComponent,
    ReceipeDetailsComponent,
    RecordloopComponent,
    GcodeComponent,
    BarComponent,
    VoidComponent,
    /*DefaultConfComponent,*/
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule, /***The HttpClientInMemoryWebApiModule module intercepts HTTP requests and returns simulated server responses. Remove it when a real server is ready to receive requests. */

    CommonModule
  ],
  providers: [ConfirmDialogService  ],
  bootstrap: [AppComponent],
  exports: [ ConfirmDialogComponent]   
})
export class AppModule { }
