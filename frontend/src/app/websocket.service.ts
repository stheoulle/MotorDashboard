// frontend/src/app/websocket.service.ts
import { EventEmitter, Injectable, Input, Output } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { Coordonnees } from './coordonneesCartesien';
import { Config } from './config';
import { DeplacementComponent } from './deplacement/deplacement.component';

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
  coordShowedUpdated : EventEmitter<Coordonnees> = new EventEmitter<Coordonnees>();
  recordedCommandUpdated : EventEmitter<string> = new EventEmitter<string>();
  configUpdated : EventEmitter<Config> = new EventEmitter<Config>();
  newOffset : EventEmitter<number> = new EventEmitter<number>();
  onCommand : boolean = false;
  public socket$!: WebSocket;
  public receivedData: MessageData[] = [];
  public  onCmd: boolean = true; 
  public coordX : number = 0;
  public coordY : number = 0;
  public X : number = 1000;
  record : boolean = false;
  gettingconfig : boolean = false;
  steppermm : string = '4';
  acceleration : string = '100';
  offset : string = '0';
  count : number = 0;
  messageslist : string[] = [];
  onreceipe : boolean = false;
  totalLoop : number = -1;
  currentLoop : number = 1;


  constructor( /*private depl: DeplacementComponent, private app : AppComponent*/) {}

  public connect(): void {
    /* Vérifier si un socket WebSocket est déjà ouvert */
    if (!this.socket$ || this.socket$.readyState !== WebSocket.OPEN) {
      /* Créer un nouveau socket WebSocket */
      this.socket$ = new WebSocket(environment.webSocketUrl);
      this.socket$.onopen = () => {
        console.log('connected');
        /* Initialiser la liste des messages en attente */
        this.messageslist = [];
      };
      this.socket$.onmessage = this.receive.bind(this);
      this.socket$.onclose = () => {
        console.log('disconnected');
        /* Réinitialiser le socket WebSocket */
      };
    }
  }
  



  receive(ev: MessageEvent): void {
    var data : MessageData;
    data = JSON.parse(ev.data);
    console.log("data received : ", data);
    this.receivedData.push(data);
    /* Check if it's a configuration command to free the loading screen or not */
    if (data.message.includes("M114")) {
      /* get the coordinates of the machine */
      this.coordX = Number(data.read.substring(data.read.indexOf("X") + 3, data.read.indexOf("Y") - 1));
      this.coordY = Number(data.read.substring(data.read.indexOf("Y") + 3, data.read.length));
      this.coordUpdated.emit({ x: this.coordX, y: this.coordY, z: 0 });
    }
    if (this.record) {
      this.recordedCommandUpdated.emit(data.message);
    }
    if (this.gettingconfig) {
      if (data.message.includes("M92")) {
        this.steppermm = data.read.substring(data.read.indexOf("X") + 2, data.read.indexOf("Y") - 1);
      }
      if (data.message.includes("M201")) {
        this.acceleration = data.read.substring(data.read.indexOf("X") + 2, data.read.indexOf("Y") - 1);
      }
      if (data.message.includes("M851")) {
        this.offset = data.read.substring(data.read.indexOf("X") + 3, data.read.indexOf("Y") - 1);
        this.newOffset.emit(Number(this.offset));
        /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
        if(this.offset !== '0'){
          this.coordX = -Number(this.offset);
          /*this.coordY = -Number(this.offset);*/
          this.coordShowedUpdated.emit({ x: this.coordX, y: 0, z: 0 }); /*change if we have offset on multiples axis*/
        }
        else{
          /*this.coordY = 0;*/
          this.coordShowedUpdated.emit({ x: 0, y: 0, z: 0 }); /*change if we have offset on multiples axis*/
        }
        console.log("offset : ", this.offset, "coordX : ", this.coordX, "coordY : ", this.coordY);
      }
      
      this.configUpdated.emit({ step: this.steppermm, acceleration: this.acceleration, offset: this.offset, name: "current configuration", speed: "fastspeed", mode: "relatif", id: 0 });
      this.count += 1;
      
    }
    if(data.message.includes("G28")){
      if(this.offset !== '0'){
        this.coordX = -Number(this.offset);
        /*this.coordY = -Number(this.offset);*/
        this.coordShowedUpdated.emit({ x: this.coordX, y: 0, z: 0 }); /*change if we have offset on multiples axis*/
      }
      else{
        /*this.coordY = 0;*/
        this.coordShowedUpdated.emit({ x: 0, y: 0, z: 0 }); /*change if we have offset on multiples axis*/
      }
      console.log("offset : ", this.offset, "coordX : ", this.coordX, "coordY : ", this.coordY);
    }
    if (this.count === 3) {
      this.gettingconfig = false;
      this.count = 0;
    }
    /* Check if all messages have been processed */
    if (this.messageslist.length === 0) {
      this.onCommand = false; /*reset the command to stop the loading screen*/
      this.onreceipe = false; /*reset the receipe to show the recording button*/
      this.totalLoop = -1;  /*reset the loop to hide the counter for the loops*/
      
    } 
    else {
      const message: string = this.messageslist[0];
      this.messageslist = this.messageslist.slice(1); // delete the first element of the array
      if (message.includes("endloop")) {
        this.endloop();
      }
      else {
        this.socket$.send(JSON.stringify({message:message}));
        console.log("message sent to server: ", message);
      }
    }
  }
    

  sendMessage(message: string) {
    /*sending the message to the backend*/
    if (this.socket$ && this.socket$.readyState === WebSocket.OPEN && this.onCommand === false) {
      /* Envoyer le premier message de la liste */
      console.log("First message sent : ", message);
      this.socket$.send(JSON.stringify({message:message}));
      this.onCommand = true;
    }
    else {
      console.log("message added to the list: ", message);
      this.messageslist.push(message);
    }
  }
  

  sendMessageStop(message: string) {
    /*send urgent stop and delete the queue*/
    this.onCommand = false;
    /*console.log("urgent stop");
    this.socket$.complete();
    this.connect();*/
    this.messageslist = [];
    this.messageslist.push("M112");
    console.log("stop done onCommand = ", this.onCommand);
  }

  endloop(){
    this.currentLoop+=1;
  }

  close() {
    if (this.socket$) {
      this.socket$.close();
    }
  }
  
}