import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DeplacementComponent } from './deplacement/deplacement.component';
import { ConfigDetailComponent } from './config-detail/config-detail.component';
import { StopComponent } from './stop/stop.component';
import { ReceipeComponent } from './receipe/receipe.component';
import { GcodeComponent } from './gcode/gcode.component';

const routes: Routes = [  /**Routes tell the router which view to display when a user clicks a link or pastes a URL into the browser address bar. */
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'deplacement', component: DeplacementComponent },
  {path : 'detail/:id', component: ConfigDetailComponent}, /**The colon (:) in the path indicates that :id is a placeholder for a specific hero id */
  {path : 'stop', component: StopComponent},
  {path : 'receipe', component: ReceipeComponent},
  {path : 'gcode', component: GcodeComponent},
  {path: '', redirectTo: '/configuration', pathMatch: 'full' }
];

@NgModule({ /**@NgModule metadata initializes the router and starts it listening for browser location changes. */
  imports: [RouterModule.forRoot(routes)],  
  exports: [RouterModule] 
})
export class AppRoutingModule { }