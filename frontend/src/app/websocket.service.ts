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
  coordShowedUpdatedY : EventEmitter<number> = new EventEmitter<number>();
  coordShowedUpdatedZ : EventEmitter<number> = new EventEmitter<number>();
  recordedCommandUpdated : EventEmitter<string> = new EventEmitter<string>();
  configUpdated : EventEmitter<Config> = new EventEmitter<Config>();
  newOffset : EventEmitter<{name: String, value: number}> = new EventEmitter<{name: String, value: number}>();
  axisUpdated : EventEmitter<{x : boolean, y : boolean, z : boolean}> = new EventEmitter<{x : boolean, y : boolean, z : boolean}> ();
  homeUpdate : EventEmitter<boolean> = new EventEmitter<boolean>();
  error : EventEmitter<string> = new EventEmitter<string>();
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
  steppermmX : (number|null) = 4;
  accelerationX : (number|null) = 100;
  offsetX : (number|null) = null;
  steppermmY : (number|null) = 4;
  accelerationY : (number|null) = 100;
  offsetY : (number|null) = null;
  steppermmZ : (number|null) = 4;
  accelerationZ : (number|null) = 100;
  offsetZ : (number|null) = null;
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
        this.onCommand = false;
        this.axisX = false;
        this.axisY = false;
        this.axisZ = false;
        this.error.emit();

        
        /* Réinitialiser le socket WebSocket */
      };
    }
  }
  
  receive(ev: MessageEvent): void {
    const extractNumber = (input: string, key: string) => {
      const regex = new RegExp(`${key}:\\s*(\\d+)`);
      const matches = input.match(regex);
      return matches ? parseInt(matches[1], 10) : '?';
    };
    var data : MessageData;
    data = JSON.parse(ev.data);
    this.receivedData.push(data);
    /* Check if it's a configuration command to free the loading screen or not */
    if (data.message.includes("M114")) {
      console.log("M114 received : ", data.read);
      /* get the coordinates of the machine */
      if(data.read.includes("X")){
      this.coordX = Number(extractNumber(data.read, "X").toString());
      }
      if(data.read.includes("Y")){
      this.coordY = Number(extractNumber(data.read, "Y").toString());
      }
      if(data.read.includes("Z")){
      this.coordZ = Number(extractNumber(data.read, "Z").toString());
      }
      this.coordUpdated.emit({ x: this.coordX, y: this.coordY, z: this.coordZ });
    }
    if (data.message.includes("G0") || data.message.includes("G1")) {
      this.sendMessage("M114");
    }
    if (this.record) {
      this.recordedCommandUpdated.emit(data.message);
    }
    if (this.gettingconfig) {
      this.updateConfig(data);
      this.count += 1;
    }
    else if (data.message.includes("M851")) {
      this.updateOffset(data); 
    }
    if (data.message.includes("M201")) {
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
      console.log("axis updated");
      this.axisUpdated.emit({x : this.axisX, y : this.axisY, z : this.axisZ});
    }
    if(data.message.includes("G28")){
      if (this.axisX) {
        console.log("X is true on G28", this.offsetX);
        this.newOffset.emit({name: "X", value: Number(this.offsetX)});
        if (this.offsetX !== 0) {
          this.coordX = Number(this.offsetX);
        }
        else{
          this.coordX = 0;
        }
      } 
      if (this.axisY) {
        console.log("Y is true on G28", this.offsetY);
        this.newOffset.emit({name: "Y", value: Number(this.offsetY)});
        if (this.offsetY !== 0) {
          this.coordY = Number(this.offsetY);
        }
        else{
          this.coordY = 0;
        }
      } 
      if (this.axisZ) {
        console.log("Z is true on G28", this.offsetZ);
        this.newOffset.emit({name: "Z", value: Number(this.offsetZ)});
        if (this.offsetZ !== 0) {
          this.coordZ = Number(this.offsetZ);
        }
        else{
          this.coordZ = 0;
        }
      } 
      this.coordShowedUpdated.emit({x: this.coordX, y : this.coordY, z: this.coordZ});     
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
      this.messageslist = this.messageslist.slice(1); // supprimer le premier élément du tableau
      console.log("messages in the list : ", this.messageslist.length);
      if (message.includes("endloop")) {
        this.endloop();
        if (this.messageslist.length > 0) {
          const nextMessage: string = this.messageslist[0];
          if (!nextMessage.includes("endloop")) {
            this.socket$.send(JSON.stringify({ message: nextMessage }));
            /*console.log("message sent to server: ", nextMessage);*/
            this.messageslist = this.messageslist.slice(1); // supprimer le message traité de la liste
          }
        }
        else{
          this.onreceipe = false;
          this.totalLoop = -1;
          this.onCommand = false; /*reset the command to stop the loading screen*/
          this.currentLoop = 1;
        }
      }
      else {
        this.socket$.send(JSON.stringify({ message: message }));
        /*console.log("message sent to server: ", message);*/
      }
    }
    
  }
    

  sendMessage(message: string) {
    /*sending the message to the backend*/
    if (this.socket$ && this.socket$.readyState === WebSocket.OPEN && this.onCommand === false) {
      /* Envoyer le premier message de la liste */
      /*console.log("First message sent : ", message);*/
      this.socket$.send(JSON.stringify({message:message}));
      this.onCommand = true;
    }
    else {
      /*console.log("message added to the list: ", message);*/
      if (message === "M114") {
        let i = this.messageslist.indexOf("M114");
        if (i !== -1) {
          this.messageslist.splice(i, 1);
        }
      }
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
      return matches ? parseInt(matches[1], 10) : null;
    };
    try {
    if(data.read.includes("X")){
      if (data.message.includes("M92")) {
        this.steppermmX = extractNumber(data.read, "X");
      }
      if (data.message.includes("M201")) {
        
        this.accelerationX = extractNumber(data.read, "X");
      }
      if (data.message.includes("M851")) {
        this.updateOffset(data);
        console.log("UC offsetX : ", this.offsetX);
        console.log("coordX : ", this.coordX);
      }
      
      this.configUpdated.emit({ step: this.steppermmX, acceleration: this.accelerationX, offset: this.offsetX, name: "Axis X", speed: "fastspeed", mode: "relative", id: 0, axis : "X", maxlength: 22 });
    }
    if (data.read.includes("Y")) {
      if (data.message.includes("M92")) {
        this.steppermmY = extractNumber(data.read, "Y");
      }
      if (data.message.includes("M201")) {
        this.accelerationY = extractNumber(data.read, "Y");
      }
      if (data.message.includes("M851")) {
        this.updateOffset(data);
        console.log("UC offsetY : ", this.offsetY);
        console.log("coordY : ", this.coordY);
      }
      
      this.configUpdated.emit({ step: this.steppermmY, acceleration: this.accelerationY, offset: this.offsetY, name: "Axis Y", speed: "fastspeed", mode: "relative", id: 1, axis : "Y" , maxlength: 22});
   
    }
    if (data.read.includes("Z")) {
      if (data.message.includes("M92")) {
        this.steppermmZ = extractNumber(data.read, "Z");
      }
      if (data.message.includes("M201")) {
        this.accelerationZ = extractNumber(data.read, "Z");
      }
      if (data.message.includes("M851")) {
        this.updateOffset(data);
        console.log("UC offsetZ : ", this.offsetZ);
        console.log("coordZ : ", this.coordZ);
      }
      
      this.configUpdated.emit({ step: this.steppermmZ, acceleration: this.accelerationZ, offset: this.offsetZ, name: "Axis Z", speed: "fastspeed", mode: "relative", id: 2, axis : "Z" , maxlength: 22});
   
    }
  }
    catch (error) {
      console.log("error on updateConfig : ", error);
      this.onCommand = false;
      this.axisX = false;
      this.axisY = false;
      this.axisZ = false;
      this.error.emit();
    }
  }

  updateOffset(data: MessageData) {
    const extractOffset = (input: string, key: string) => {
      const regex = new RegExp(`${key}:\\s*(\\d+)`, 'i');
      const match = input.match(regex);
      return match ? Number(match[1]) : NaN;
    };
  
    const read = data.read;
    if (read.indexOf('X') !== -1) {
      this.offsetX = extractOffset(read, 'X');
      this.newOffset.emit({name: "X", value: Number(this.offsetX)});
    }
    if (read.indexOf('Y') !== -1) {
      this.offsetY = extractOffset(read, 'Y');
      this.newOffset.emit({name: "Y", value: Number(this.offsetY)});
    }
    if (read.indexOf('Z') !== -1) {
      this.offsetZ = extractOffset(read, 'Z');
      this.newOffset.emit({name: "Z", value: Number(this.offsetZ)});
    }
  
    console.log('offset updated, gettingconfig = ', this.gettingconfig);
    if (!this.gettingconfig) {
      this.homeUpdate.emit(false);
    }
  }
  


}