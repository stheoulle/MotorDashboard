import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { WebSocketService } from "./websocket.service";
import { Config } from './config';
import configurations from './configs.json';
import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';

"./services/websocket.service.ts:"

interface Axis{
  name: string; //X,Y,Z
  conf: Config;
  defaultconf: Config;
  coordinate: (number|null);
  destination: (number|null);
  sent: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy {
  resetCoord : EventEmitter<string> = new EventEmitter<string>();
  title : string = 'WebApp Scantech';
  pause : boolean = false;
  message : string = '';
  speedmode: string = "fastspeed";
  knownConfig : boolean = false;
  axis: Axis[] = [
    {name: "X", conf: configurations[0], defaultconf: configurations[0], coordinate: 0, destination: 0, sent: false},
    {name: "Y", conf: configurations[1], defaultconf: configurations[1], coordinate: 0, destination: 0, sent: false},
    {name: "Z", conf: configurations[2], defaultconf: configurations[2], coordinate: 0, destination: 0, sent: false}
  ];

  movingAllowed? : boolean;
  home : boolean = false;
  receipelistitem : string[] = [];
  public recordlist : string[] = [];
  href : string = "";
  lock : boolean = false;
  gettingconfig : boolean = false;
  /*config displayed in the default config component*/
  showConfigs : boolean = false;

  constructor( public webSocketService: WebSocketService, public routing : AppRoutingModule, public router: Router, private configService : ConfigService ){ 
    /*opening the websocket connection*/
    this.webSocketService.connect();
  } 

  ngOnInit() {
    ///Putting 0,1,2 as the id of the configs on X,Y,Z
    this.webSocketService.configUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      let axis = this.axis.find((entry) => entry.name == value.axis);
      if (axis) {
        axis.conf = value;
        axis.sent = true;
        axis.coordinate = Number(value.offset);
      }
    });
    this.webSocketService.error.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      console.log("error ",value);
      this.knownConfig = false;
      this.home = false;
      this.movingAllowed = false;
    });
    this.webSocketService.coordUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      for (let axis of this.axis) {
        if (axis.name == "X") {
          axis.coordinate = value.x;
        }
        if (axis.name == "Y") {
          axis.coordinate = value.y;
        }
        if (axis.name == "Z") {
          axis.coordinate = value.z;
        }
      }
    });
  }

  sendMessage(message: string) {
    /*sending the message to the backend*/
    if(this.webSocketService.socket$.readyState == 1){
    console.log("onreceipe : ",this.webSocketService.onreceipe);
    if(message == "M112")
    {
      this.webSocketService.sendMessageStop();
    }
    else{
      if (this.knownConfig == false && message != "M112"){
        /*this.sendConfig(this.config.acceleration, this.config.speed, this.config.mode, this.config.name, this.config.step, this.config.offset);*/
        this.getConfig();
        this.knownConfig = true;
        console.log("default config sent");
        if (message== "G28"){
          this.movingAllowed = true;
          this.home = true;
        }
        this.webSocketService.sendMessage(message);
        console.log(message);
      }
      else {
        if (message== "G28" && this.home == false){   /*if the config is known, we send the home, if the home is unknown*/
          this.movingAllowed = true;
          this.home = true;
        }
        this.webSocketService.sendMessage(message);
        console.log(message);
      }
    }
  }
  }

  sendMessageList(message: string) {
    /*sending the message to the backend*/
    if(this.webSocketService.socket$.readyState == 1){
    if (this.knownConfig == false && message != "M112"){
      /*if the config is not known, we ask the default config*/
        for (let axis of this.axis) {
          axis.conf = axis.defaultconf;
        }
        this.getConfig();
        this.knownConfig = true;
        console.log("default config sent");
        this.webSocketService.sendMessage("G28");
        this.home = true;
    }
    if (message != "M112" && this.home == false && message != "G28"){
      /*if the config is known and the home is not asked first we send the home*/
      this.webSocketService.sendMessage("G28");
      this.movingAllowed = true;
      this.home = true;
    }
    if (this.knownConfig == true && this.home == true && message != "G28" || message == "M112" ){
      /*if the config is known and we know the home, we send the message, or urgent stop bypass the other*/
      this.webSocketService.sendMessage(message);
      console.log(message);
    }
  }
  }

  Play(): void {
     if (this.movingAllowed == false && this.webSocketService.socket$.readyState == 1){   /*Go again after the pause*/
      this.movingAllowed = true;
      this.pause = false;
      this.sendMessage("M24");
    }
  }

  Pause(): void {
    if (this.movingAllowed == true && this.webSocketService.socket$.readyState == 1){   /*We want a pause*/
      this.pause = true;
      this.movingAllowed = false;
      this.sendMessage("M114");
      this.sendMessage("M25")
    }
  }

  sendConfig(axis: String, config: Config): void {
    if(this.webSocketService.socket$.readyState == 1){
      this.knownConfig = true;
      if (config.speed== "fastspeed"){
        this.speedmode = "G0";
      }
      else {
        this.speedmode = "G1";
      }
      /*Definition of the acceleration on unit/second^2 for one motor */
      this.sendMessage("M201 " + axis + config.acceleration);
      if (config.mode == "relative"){
        this.sendMessage("G91");
      }
      else {
        this.sendMessage("G90");
      }
      /*Definition of the speed on unit/second for one motor */
      this.webSocketService.sendMessage("M92"+ axis + config.step);
      if(!this.lock){
        /*Change the lock status*/
        this.webSocketService.sendMessage("#505 =1");
      }
      /*Definition of the offset on unit for one motor */
      this.webSocketService.sendMessage("M851 "+ axis + config.offset);
      this.lock = true;
      console.log("locked",this.lock);
      for (let entry of this.axis) {
        if (entry.name == axis) {
          entry.conf = config;
        }
      }
      this.speedmode = config.speed;
      this.resetCoord.emit();
    }
  }
  getConfig(): void {
    /*ask the server for the current config on the motor, using the norm ?...*/
    if(this.webSocketService.socket$.readyState == 1){
    this.webSocketService.gettingconfig =true;
    this.webSocketService.sendMessage("?M201");
    this.webSocketService.sendMessage("?M92");
    this.webSocketService.sendMessage("?M851");
    this.webSocketService.sendMessage("G91");   /*set the mode to relative per default*/
    this.knownConfig = true;
  }
  }
  addCommandRecord(newItem: string) {
    this.recordlist.push(newItem);
  }
  deleteRecord(): void {
    /*delete the config with the corresponding id*/
    this.recordlist = [];
  }
  unlock(): void {
    this.lock = false;
    this.sendMessage("#505 0");
    console.log("unlocked",this.lock);
  }
  locker(): void {
    this.lock = true;
    this.sendMessage("#505 1");
    console.log("locked",this.lock);
  }
  ngOnDestroy() {
    /*closing the websocket connection*/
    this.webSocketService.close();
  }
}