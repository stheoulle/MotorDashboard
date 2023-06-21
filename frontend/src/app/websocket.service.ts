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
  coordShowedUpdatedX : EventEmitter<number> = new EventEmitter<number>();
  coordShowedUpdatedY : EventEmitter<number> = new EventEmitter<number>();
  coordShowedUpdatedZ : EventEmitter<number> = new EventEmitter<number>();
  recordedCommandUpdated : EventEmitter<string> = new EventEmitter<string>();
  configUpdatedX : EventEmitter<Config> = new EventEmitter<Config>();
  configUpdatedY : EventEmitter<Config> = new EventEmitter<Config>();
  configUpdatedZ : EventEmitter<Config> = new EventEmitter<Config>();
  newOffsetX : EventEmitter<number> = new EventEmitter<number>();
  newOffsetY : EventEmitter<number> = new EventEmitter<number>();
  newOffsetZ : EventEmitter<number> = new EventEmitter<number>();
  axisUpdated : EventEmitter<{x : boolean, y : boolean, z : boolean}> = new EventEmitter<{x : boolean, y : boolean, z : boolean}> ();
  onCommand : boolean = false;
  public socket$!: WebSocket;
  public receivedData: MessageData[] = [];
  public  onCmd: boolean = true; 
  public coordX : number = 0;
  public coordY : number = 0;
  public coordZ : number = 0;
  public X : number = 1000;
  record : boolean = false;
  gettingconfig : boolean = false;
  steppermmX : string = '4';
  accelerationX : string = '100';
  offsetX : string = '0';
  steppermmY : string = '4';
  accelerationY : string = '100';
  offsetY : string = '0';
  steppermmZ : string = '4';
  accelerationZ : string = '100';
  offsetZ : string = '0';
  count : number = 0;
  messageslist : string[] = [];
  onreceipe : boolean = false;
  totalLoop : number = -1;
  currentLoop : number = 1;
  axisX : boolean = false;
  axisY : boolean = false;
  axisZ : boolean = false;


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
    this.receivedData.push(data);
    /* Check if it's a configuration command to free the loading screen or not */
    if (data.message.includes("M114")) {
      /* get the coordinates of the machine */
      if(data.read.includes("X")){
      this.coordX = Number(data.read.substring(data.read.indexOf("X") + 3, data.read.indexOf("X") + 5));
      }
      if(data.read.includes("Y")){
      this.coordY = Number(data.read.substring(data.read.indexOf("Y") + 3, data.read.indexOf("Y") + 5));
      }
      if(data.read.includes("Z")){
      this.coordZ = Number(data.read.substring(data.read.indexOf("Z") + 3, data.read.length));
      }
      this.coordUpdated.emit({ x: this.coordX, y: this.coordY, z: this.coordZ });
    }
    if (this.record) {
      this.recordedCommandUpdated.emit(data.message);
    }
    if (this.gettingconfig) {
      this.updateConfig(data);
      this.count += 1;
    }
    else{
      if (data.message.includes("M851")) {
        this.updateOffset(data);  
      }
    }
    if (data.message.includes("M92")) {
      console.log("data message : ",data.message);
      if (data.read.includes("X")) {
        this.axisX = true;
      }
      else{
        this.axisX = false;
      }
      if (data.read.includes("Y")) {
        this.axisY = true;
      }
      else{
        this.axisY = false;
      }
      if (data.read.includes("Z")) {
        this.axisZ = true;
      }
      else{
        this.axisZ = false;
      }
      this.axisUpdated.emit({x : this.axisX, y : this.axisY, z : this.axisZ});
    }

    if(data.message.includes("G28")){
      if(data.read.includes("X")){
        this.offsetX = data.read.substring(data.read.indexOf("X") + 3, data.read.indexOf("X") +5);
        this.newOffsetX.emit(Number(this.offsetX));
        /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
        if(this.offsetX !== '0'){
          this.coordX = -Number(this.offsetX);
          /*this.coordY = -Number(this.offset);*/
          this.coordShowedUpdatedX.emit(this.coordX); /*change if we have offset on multiples axis*/
        }
      }
      else if (data.read.includes("Y")){
        this.offsetY = data.read.substring(data.read.indexOf("Y") + 3, data.read.indexOf("Y") +5);
        this.newOffsetY.emit(Number(this.offsetY));
        /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
        if(this.offsetY !== '0'){
          this.coordY = -Number(this.offsetY);
          /*this.coordY = -Number(this.offset);*/
          this.coordShowedUpdatedY.emit(this.coordY); /*change if we have offset on multiples axis*/
        }
      }
      else if (data.read.includes("Z")){
        this.offsetZ = data.read.substring(data.read.indexOf("Z") + 3, data.read.indexOf("Z") +5);
        this.newOffsetZ.emit(Number(this.offsetZ));
        /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
        if(this.offsetZ !== '0'){
          this.coordZ = -Number(this.offsetZ);
          /*this.coordY = -Number(this.offset);*/
          this.coordShowedUpdatedZ.emit(this.coordZ); /*change if we have offset on multiples axis*/
        }
      }     
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
  

  sendMessageStop() {
    /*send urgent stop and delete the queue*/
    this.onCommand = false;
    /*console.log("urgent stop");
    this.socket$.complete();
    this.connect();*/
    this.messageslist = [];
    this.messageslist.push("M112");
    console.log("stop done onCommand = ", this.onCommand);
    this.messageslist.push("M114");
  }

  endloop(){
    this.currentLoop+=1;
  }

  close() {
    if (this.socket$) {
      this.socket$.close();
    }
  }

  updateConfig(data : MessageData){
    ///Change the configuration of the machine
    ///change the range of the substring might be better if we have longer steps, acceleration or offset (use a function to get the index of the first number and the last number)
    const extractNumber = (input: string, key: string) => {
      const regex = new RegExp(`${key}:\\s*(\\d+)`);
      const matches = input.match(regex);
      return matches ? parseInt(matches[1], 10) : '?';
    };
    
    if(data.read.includes("X")){
      if (data.message.includes("M92")) {
        this.steppermmX = extractNumber(data.read, "X").toString();
      }
      if (data.message.includes("M201")) {
        
        this.accelerationX = extractNumber(data.read, "X").toString();
      }
      if (data.message.includes("M851")) {
        this.offsetX = extractNumber(data.read, "X").toString();
        this.newOffsetX.emit(Number(this.offsetX));
        /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
        if(this.offsetX !== '0'){
          this.coordX = -Number(this.offsetX);
          /*this.coordY = -Number(this.offset);*/
          this.coordShowedUpdatedX.emit(this.coordX); /*change if we have offset on multiples axis*/
        }
        else{
          /*this.coordY = 0;*/
          this.coordShowedUpdated.emit({ x: 0, y: 0, z: 0 }); /*change if we have offset on multiples axis*/
        }
      }
      
      this.configUpdatedX.emit({ step: this.steppermmX, acceleration: this.accelerationX, offset: this.offsetX, name: "Axis X", speed: "fastspeed", mode: "relatif", id: 0, axis : "X" });
    }
    if (data.read.includes("Y")) {
      if (data.message.includes("M92")) {
        this.steppermmY = extractNumber(data.read, "Y").toString();
      }
      if (data.message.includes("M201")) {
        this.accelerationY = extractNumber(data.read, "Y").toString();
      }
      if (data.message.includes("M851")) {
        this.offsetY = extractNumber(data.read, "Y").toString();
        this.newOffsetY.emit(Number(this.offsetY));
        /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
        if(this.offsetY !== '0'){
          this.coordY = -Number(this.offsetY);
          /*this.coordY = -Number(this.offset);*/
          this.coordShowedUpdatedY.emit( this.coordY); /*change if we have offset on multiples axis*/
        }
        else{
          /*this.coordY = 0;*/
          this.coordShowedUpdated.emit({ x: 0, y: 0, z: 0 }); /*change if we have offset on multiples axis*/
        }
      }
      
      this.configUpdatedY.emit({ step: this.steppermmY, acceleration: this.accelerationY, offset: this.offsetY, name: "Axis Y", speed: "fastspeed", mode: "relatif", id: 1, axis : "Y" });
   
    }
    if (data.read.includes("Z")) {
      if (data.message.includes("M92")) {
        this.steppermmZ = extractNumber(data.read, "Z").toString();
      }
      if (data.message.includes("M201")) {
        this.accelerationZ = extractNumber(data.read, "Z").toString();
      }
      if (data.message.includes("M851")) {
        this.offsetZ = extractNumber(data.read, "Z").toString();
        this.newOffsetZ.emit(Number(this.offsetZ));
        /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
        if(this.offsetZ !== '0'){
          this.coordZ = -Number(this.offsetZ);
          /*this.coordY = -Number(this.offset);*/
          this.coordShowedUpdatedZ.emit( this.coordY); /*change if we have offset on multiples axis*/
        }
        else{
          /*this.coordY = 0;*/
          this.coordShowedUpdated.emit({ x: 0, y: 0, z: 0 }); /*change if we have offset on multiples axis*/
        }
      }
      
      this.configUpdatedZ.emit({ step: this.steppermmZ, acceleration: this.accelerationZ, offset: this.offsetZ, name: "Axis Z", speed: "fastspeed", mode: "relatif", id: 2, axis : "Z" });
   
    }
  }

  updateOffset(data : MessageData){
    const extractNumber = (input: string, key: string) => {
      const regex = new RegExp(`${key}:\\s*(\\d+)`);
      const matches = input.match(regex);
      return matches ? parseInt(matches[1], 10) : '?';
    };

    if(data.read.includes("X")){
      this.offsetX = extractNumber(data.read, "X").toString();
      this.newOffsetX.emit(Number(this.offsetX));
      /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
      if(this.offsetX !== '0'){
        this.coordX = -Number(this.offsetX);
        /*this.coordY = -Number(this.offset);*/
        this.coordShowedUpdatedX.emit(this.coordX); /*change if we have offset on multiples axis*/
      }
    }
    else if (data.read.includes("Y")){
      this.offsetY = extractNumber(data.read, "Y").toString();
      this.newOffsetY.emit(Number(this.offsetY));
      /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
      if(this.offsetY !== '0'){
        this.coordY = -Number(this.offsetY);
        /*this.coordY = -Number(this.offset);*/
        this.coordShowedUpdatedY.emit(this.coordY); /*change if we have offset on multiples axis*/
      }
    }
    else if (data.read.includes("Z")){
      this.offsetZ = extractNumber(data.read, "Z").toString();
      this.newOffsetZ.emit(Number(this.offsetZ));
      /*change the type of the newOffset to {} if we have offset on multiples axis, and add 2 others variables to keep track of them (newOffsetY and newOffsetZ*/
      if(this.offsetZ !== '0'){
        this.coordZ = -Number(this.offsetZ);
        /*this.coordY = -Number(this.offset);*/
        this.coordShowedUpdatedZ.emit(this.coordZ); /*change if we have offset on multiples axis*/
      }
    }      
  }
  
}