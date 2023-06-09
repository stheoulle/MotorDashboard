import { Component, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../app.component';
import { delay } from 'rxjs';
import { WebSocketService } from '../websocket.service';
import { ReceipeService } from '../receipe.service';


@Component({
  selector: 'app-recordloop',
  templateUrl: './recordloop.component.html',
  styleUrls: ['./recordloop.component.css']
})
export class RecordloopComponent {
  record : boolean = false;
  loop : number = 1;

  constructor(private app : AppComponent, public ws : WebSocketService, private reicipe : ReceipeService) { }

  ngOnInit(): void {
    this.ws.recordedCommandUpdated.subscribe((value) => {
      this.app.recordlist.push(value);
    });
  }

  startRecording () {
    /*start recording the commands and update the list when a new command arrives using ngonchanges*/
    this.ws.record = true;
  }

  stopRecording () {
    /*stop recording the commands*/
    this.ws.record = false;
    this.app.recordlist.push("M114");
  }

  sendRecording () {
    /*send the recorded commands to the backend*/
    if(this.ws.record == false){
      this.reicipe.addReceipe("default", this.app.recordlist, this.app.receipelistitem.length+1);
      for(let j = 0; j < this.loop; j++){
        for (let i = 0; i < this.app.recordlist.length; i++) {
          this.app.sendMessage(this.app.recordlist[i]);
          }
      }
    }
    else{
      alert("Please stop recording before sending the commands");
    }
  }

  
}
