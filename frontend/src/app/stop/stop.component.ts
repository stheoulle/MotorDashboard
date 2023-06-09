import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { DeplacementComponent } from '../deplacement/deplacement.component';
import { AppComponent } from '../app.component';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-stop',
  templateUrl: './stop.component.html',
  styleUrls: ['./stop.component.css']
})
export class StopComponent {
  public title : string = "";

  constructor(private router:Router, private app : AppComponent, private ws : WebSocketService) {
    /*if we are on the stop page, we send the command M112 to stop the machine*/
    this.ws.sendMessageStop("M112");
    this.app.sendMessage("M114");
    this.app.lock = false;
    alert("The machine has been stopped");
    /*this.app.home = false;    /*Remove this if an urgent stop does not reset the home position*/

  }  

}
