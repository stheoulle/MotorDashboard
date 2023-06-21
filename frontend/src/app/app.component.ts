import { Component, OnDestroy } from '@angular/core';
import { WebSocketService } from "./websocket.service";
import { Config, ConfigInput } from './config';
import configurations from './configs.json';
import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';


"./services/websocket.service.ts:"

interface ConfigData {
  id: number;
  speed: string;
  mode: string;
  acceleration: string;
  name: string;
  step : string;
  offset : string;
  axis : string;
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
  currentConfigX : Config = this.configurationdata[0];
  currentConfigY : Config = this.configurationdata[4];
  currentConfigZ : Config = this.configurationdata[5];
  movingAllowed? : boolean;
  home : boolean = false;
  receipelistitem : string[] = [];
  public recordlist : string[] = [];
  href : string = "";
  lock : boolean = false;
  gettingconfig : boolean = false;
  
  

  /*config displayed in the default config component*/
  inputConfigX : ConfigInput = this.configurationdata[0];
  inputConfigY : ConfigInput = this.configurationdata[4];
  inputConfigZ : ConfigInput = this.configurationdata[5];

  constructor( public webSocketService: WebSocketService, public routing : AppRoutingModule, public router: Router, private configService : ConfigService ){ 
    /*opening the websocket connection*/
    this.webSocketService.connect();
  } 

  ngOnInit() {
    ///Use the indexOf instead of 0, 4 and 5
    this.webSocketService.configUpdatedX.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.inputConfigX = value;
      this.configService.configurationdata[0].acceleration = value.acceleration;
      this.configService.configurationdata[0].speed = value.speed;
      this.configService.configurationdata[0].mode = value.mode;
      this.configService.configurationdata[0].name = value.name;
      this.configService.configurationdata[0].step = value.step;
      this.configService.configurationdata[0].offset = value.offset;
      this.configService.configurationdata[0].axis = value.axis;
      /*copy all except id*/
    });
    this.webSocketService.configUpdatedY.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.inputConfigY = value;
      this.configService.configurationdata[4].acceleration = value.acceleration;
      this.configService.configurationdata[4].speed = value.speed;
      this.configService.configurationdata[4].mode = value.mode;
      this.configService.configurationdata[4].name = value.name;
      this.configService.configurationdata[4].step = value.step;
      this.configService.configurationdata[4].offset = value.offset;
      this.configService.configurationdata[4].axis = value.axis;
      /*copy all except id*/
    });
    this.webSocketService.configUpdatedZ.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.inputConfigZ = value;
      this.configService.configurationdata[5].acceleration = value.acceleration;
      this.configService.configurationdata[5].speed = value.speed;
      this.configService.configurationdata[5].mode = value.mode;
      this.configService.configurationdata[5].name = value.name;
      this.configService.configurationdata[5].step = value.step;
      this.configService.configurationdata[5].offset = value.offset;
      this.configService.configurationdata[5].axis = value.axis;
      /*copy all except id*/
    });
  
  }

    


  /*ngOnChanges() {   /*What is this function for ?
    this.href = this.router.url;
    console.log(this.href);
  }*/
  sendMessage(message: string) {
    /*sending the message to the backend*/
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
        /*this.sendConfig(this.config.acceleration, this.config.speed, this.config.mode, this.config.name/*, this.config.movingmode, this.config.step, this.config.offset);*/
        this.getConfig();
        this.knownConfig = true;
        console.log("default config sent");
        this.webSocketService.sendMessage("G28");
        this.home = true;
    }
    if (message != "M112" && this.home == false && message != "G28"){
      /*if the config is known and the home is not asked first we send the home*/
      this.webSocketService.sendMessage("G28");
      this.StateChange();
      this.home = true;
    }

    if (this.knownConfig == true && this.home == true && message != "G28" || message == "M112" ){
      /*if the config is known and we know the home, we send the message, or urgent stop bypass the other*/
      this.webSocketService.sendMessage(message);
      console.log(message);
    }
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


  sendConfig(acceleration : string, speed : string, mode : string, name : string/*, movingmode : string*/, step : string, offset : string, axis : string): void {

    this.knownConfig = true;
    if (speed== "fastspeed"){
      this.speedmode = "G0";
    }
    else {
      this.speedmode = "G1";
    }
    /*Definition of the acceleration on unit/second^2 for one motor */
    this.sendMessage("M201 " + axis +acceleration);
    if (mode == "relatif"){
      this.sendMessage("G91");
    }
    else {
      this.sendMessage("G90");
    }
    /*Definition of the speed on unit/second for one motor */
    /*this.webSocketService.sendMessage("M92 X"+step);  */   ///////////////////////////////  A REVOIR
    if(!this.lock){
      /*Change the lock status*/
      this.webSocketService.sendMessage("#505 =1");
    }
    /*Definition of the offset on unit for one motor */
    this.webSocketService.sendMessage("M851 "+axis+offset);
    this.lock = true;
    console.log("locked",this.lock);
    /*this.sendMessage("M92"+step);*/
    /*console.log("movingmode saved");*/
    /*change the config displayed in the default config component*/
    this.inputConfigX = {speed: speed, mode : mode, acceleration : acceleration, name : name/*, movingmode : movingmode*/, step : step, offset : offset, axis : axis};
    /*change the speedmode*/
    this.speedmode = speed;

  }

  getConfig(): void {
    /*ask the server for the current config on the motor, using the norm ?...*/
    this.webSocketService.gettingconfig =true;
    this.webSocketService.sendMessage("?M201");
    this.webSocketService.sendMessage("?M92");
    this.webSocketService.sendMessage("?M851");
    this.webSocketService.sendMessage("G91");   /*set the mode to relative per default*/
    this.knownConfig = true;
    /*this.inputConfig.acceleration = await this.webSocketService.receivedData[0].read;
    console.log(this.inputConfig.acceleration);*/
  }

  getReceipe(): Config {
    /*get the config displayed in the default config component*/
    return this.configurationdata[0];
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

  ngOnDestroy() {
    /*closing the websocket connection*/
    this.webSocketService.close();
  }
}
