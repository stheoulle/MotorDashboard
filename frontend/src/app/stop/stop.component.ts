import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { AppComponent } from '../app.component';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-stop',
  templateUrl: './stop.component.html',
  styleUrls: ['./stop.component.css']
})
export class StopComponent {
  public title : string = "";

  constructor(private app : AppComponent, private ws : WebSocketService) {
    /*if we are on the stop page, we send the command M112 to stop the machine*/
    this.ws.sendMessageStop();
    this.app.lock = false;
    this.app.home = false;
    alert("The machine will be stopped");
  }  

}
