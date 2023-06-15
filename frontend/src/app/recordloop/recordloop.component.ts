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

  constructor(public app : AppComponent, public ws : WebSocketService, private receipe : ReceipeService) { }

  ngOnInit(): void {
    this.ws.recordedCommandUpdated.subscribe((value) => {
      this.app.recordlist.push(value);
    });
  }

  startRecording () {
    /*start recording the commands and update the list when a new command arrives using ngonchanges*/
    this.ws.record = true;
    this.app.recordlist = [];
  }

  stopRecording () {
    /*stop recording the commands*/
    this.ws.record = false;
    this.app.recordlist.push("M114");
    this.sendRecording();
  }

  sendRecording () {
    /*send the recorded commands to the backend*/
    if(this.ws.record == false){
      this.receipe.addReceipe("new recording", this.app.recordlist, this.app.receipelistitem.length+1);
      /*for(let j = 0; j < this.loop; j++){   Uncomment if we want to send the recording as soon as we stop recording
        for (let i = 0; i < this.app.recordlist.length; i++) {
          this.app.sendMessage(this.app.recordlist[i]);
          }
      }*/
    }
  }

  
}
