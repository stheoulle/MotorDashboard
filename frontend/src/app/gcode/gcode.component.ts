import { Component } from '@angular/core';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-gcode',
  templateUrl: './gcode.component.html',
  styleUrls: ['./gcode.component.css']
})
export class GcodeComponent {
  message : string = "";
  constructor( public ws : WebSocketService) { }

  send(){
    /*send the gcode to the backend*/
    this.ws.sendMessage(this.message);
  }
}
