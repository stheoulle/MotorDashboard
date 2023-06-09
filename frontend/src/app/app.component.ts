import { Component, OnDestroy } from '@angular/core';
import { WebSocketService } from "./websocket.service";
import { Config, ConfigInput } from './config';
import configurations from './configs.json';
import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';


"./services/websocket.service.ts:"

interface ConfigData {
  id: number;
  speed: string;
  mode: string;
  acceleration: string;
  name: string;
  step : string;
  offset : string;
  /*movingmode: string;*/
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title : string = 'WebApp Scantech';
  /*state : string = "Etat : undefined";*/
  pause : boolean = false;
  message : string = '';
  speedmode: string = "fastspeed";
  knownConfig : boolean = false;
  configurationdata : ConfigData[] = configurations;
  /*configurationdata : ConfigData[] = configurations;*/
  config? : Config;
  currentConfig? : Config;
  movingAllowed? : boolean;
  home : boolean = false;
  receipelistitem : string[] = [];
  public recordlist : string[] = [];
  href : string = "";
  lock : boolean = false;

  /*config displayed in the default config component*/
  inputConfig : ConfigInput = this.configurationdata[0];

  constructor( public webSocketService: WebSocketService, public routing : AppRoutingModule, public router: Router ){ 
    /*opening the websocket connection*/
    this.webSocketService.connect();
  } 

  /*ngOnChanges() {   /*What is this function for ?
    this.href = this.router.url;
    console.log(this.href);
  }*/
  sendMessage(message: string) {
    /*sending the message to the backend*/
    if(message == "M112")
    {
      this.webSocketService.sendMessageStop(message);
    }
    else{
      if (this.knownConfig == false && message != "M112"){
        this.config = this.getReceipe();
        this.sendConfig(this.config.acceleration, this.config.speed, this.config.mode, this.config.name/*, this.config.movingmode*/, this.config.step, this.config.offset);
        console.log("default config sent");
        if (message== "G28"){
          this.StateChange(); 
          this.home = true;
        }
        
        this.webSocketService.sendMessage(message);
        console.log(message);
      }
      else {
        if (message== "G28" && this.home == false){   /*if the config is known, we send the home, if the home is unknown*/
          this.StateChange(); 
          this.home = true;
        }
        this.webSocketService.sendMessage(message);
        console.log(message);
      }
    }
  }

  sendMessageList(message: string) {
    /*sending the message to the backend*/
    if (this.knownConfig == false && message != "M112"){
      /*if the config is not known, we send the default config*/
        this.config = this.getReceipe();
        this.sendConfig(this.config.acceleration, this.config.speed, this.config.mode, this.config.name/*, this.config.movingmode*/, this.config.step, this.config.offset);
        console.log("default config sent");
    }
    if (message != "M112" && this.home == false && !message.includes("G28")){
      /*if the config is known, we send the home*/
      this.webSocketService.sendMessage("G28");
      this.StateChange();
      this.home = true;
    }

    if (this.knownConfig == true && this.home == true && message != "G28" || message == "M112" ){
      /*if the config is known and we are home, we send the message, or urgent stop bypass the other*/
      this.webSocketService.sendMessage(message);
      console.log(message);
    }
  }

  ngOnDestroy() {
    /*closing the websocket connection*/
    this.webSocketService.close();
  }


  Play(): void {

     if (this.movingAllowed == false){   /*Go again after the pause*/
      this.movingAllowed = true;
      /*this.state = "Etat : re Play"; */
      this.pause = false;
      this.sendMessage("M24");
    }
    /*else if (this.movingAllowed == undefined){
      this.state = "Etat : Waiting for home";
    }*/
  }

  Pause(): void {

    if (this.movingAllowed == true){   /*We want a pause*/
      this.pause = true;
      this.movingAllowed = false;
     /* this.state = "Etat : Paused";*/
      this.sendMessage("M114");
      this.sendMessage("M25")
      
      
    }
    /*else if (this.movingAllowed == undefined){
      this.state = "Etat : Waiting for home";
    }*/
  }

  StateChange(): void {
      this.movingAllowed = true;
      /*this.state = "Etat : Start";*/
      
  }


  sendConfig(acceleration : string, speed : string, mode : string, name : string/*, movingmode : string*/, step : string, offset : string): void {
    this.knownConfig = true;
    if (speed== "fastspeed"){
      this.speedmode = "G0";
    }
    else {
      this.speedmode = "G1";
    }
    this.sendMessage("M201 "+acceleration);
    if (mode == "relatif"){
      this.sendMessage("G91");
    }
    else {
      this.sendMessage("G90");
    }
    this.webSocketService.sendMessage("M92 "+step);
    if(!this.lock){
      /*Change the lock status*/
      this.webSocketService.sendMessage("#505 1");
    }
    this.webSocketService.sendMessage("M851 "+offset);
    this.lock = true;
    console.log("locked",this.lock);
    /*this.sendMessage("M92"+step);*/
    /*console.log("movingmode saved");*/
    /*change the config displayed in the default config component*/
    this.inputConfig = {speed: speed, mode : mode, acceleration : acceleration, name : name/*, movingmode : movingmode*/, step : step, offset : offset};
    /*change the speedmode*/
    this.speedmode = speed;
    
  }

  getReceipe(): Config {
    /*get the config displayed in the default config component*/
    return this.configurationdata[0];
  }

  ChangeStatusOnCommand(newItem: boolean) {
    this.pause= newItem;    /*change the status of the pause !! Change to OnCommand*/
  }


/*
  Stop() : void {
    this.movingAllowed = undefined;
    this.etat = "Etat : Stop";
    this.stop.stopThis("La configuration a été sauvegardée");
  }*/

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
}
