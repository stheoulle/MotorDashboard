// frontend/src/app/websocket.service.ts
import { EventEmitter, Injectable, Input, Output } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { Coordonnees } from './coordonneesCartesien';

interface MessageData {
  message: string;
  time?: string;
  read : string;
  done? : boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  /*@Input() setup? : boolean;*/
  /*@Output() deplacement? : Coordonnees;*/
  coordUpdated : EventEmitter<Coordonnees> = new EventEmitter<Coordonnees>();
  recordedCommandUpdated : EventEmitter<string> = new EventEmitter<string>();
  onCommand : boolean = false;
  private socket$!: WebSocketSubject<any>;
  public receivedData: MessageData[] = [];
  public  onCmd: boolean = true; 
  public coordX : number = 0;
  public coordY : number = 0;
  public X : number = 1000;
  record : boolean = false;


  constructor( /*private depl: DeplacementComponent, private app : AppComponent*/) {}

  public connect(): void {
    /*connect the websocket*/
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(environment.webSocketUrl);
      this.socket$.subscribe((data: MessageData) => {
        this.receivedData.push(data);
        console.log(data);
        /*Check if it's a configuration command to free the loading screen or not*/
        if(!(data.message.includes("M201" )) && !(data.message.includes("G91")) && !(data.message.includes("G91")) || data.message.includes("M24") || data.message.includes("M25") ){
          this.onCommand = false;

        }
        if(data.message.includes("M114")){
          /*get the coordinates of the machine*/
          this.coordX = Number(data.read.substring(data.read.indexOf("X")+3, data.read.indexOf("Y")-1));
          this.coordY = Number(data.read.substring(data.read.indexOf("Y")+3, data.read.length));
          this.coordUpdated.emit({x: this.coordX, y: this.coordY, z: 0});
        }
        if (this.record)
        {
          this.recordedCommandUpdated.emit(data.message);
        }
      });
    }
  }

  sendMessage(message: string) {
    /*sending the message to the backend*/
    this.onCommand = true;
    this.socket$.next({ message });
    
  }

  sendMessageStop(message: string) {
    /*send urgent stop and delete the queue*/
    this.onCommand = false;
    /*console.log("urgent stop");
    this.socket$.complete();
    this.connect();*/
    this.socket$.next("M112");
    console.log("stop done onCommand = ", this.onCommand);
  }

  close() {
    this.socket$.complete();
  }
}