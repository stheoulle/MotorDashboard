import { Component, Output, EventEmitter, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Coordonnees } from '../coordonneesCartesien';
import { CoordService } from '../coord.service';
import { COORDONNEES } from '../mock.coordonnees';
import { AppComponent } from '../app.component';
import { WebSocketService } from '../websocket.service';
import { ConfigService } from '../config.service';


@Component({
  selector: 'app-deplacement',
  templateUrl: './deplacement.component.html',
  styleUrls: ['./deplacement.component.css'],

})
export class DeplacementComponent implements OnChanges {
  
  onCommand : boolean = false;
  coordonnees : Coordonnees[] = [];
  coord = COORDONNEES;
  selectedStep?: number;
  orientation? : string;
  deplacement? : string;
  commande : string = "";
  speedmode: string = "G0";
  signe? : string;
  listSpeedMode : string = "feedrate";
  unknown : string = "unknown";
  update : boolean = false;
  coordinateX : number = 0;
  coordinateY : number = 0;
  coordinateZ : number = 0;
  axisX : boolean = false;
  axisY : boolean = false;
  axisZ : boolean = false;
  tempX : number = 0;
  tempY : number = 0;
  tempZ : number = 0;

  constructor(private coordService: CoordService, public app : AppComponent, public ws : WebSocketService, private configService : ConfigService) {
  }

  /*ngOnChanges() {
    this.systemCoord[0] = this.coord[0];  /*Update the coordinates of the system
  }*/
  ngOnInit(): void {
    this.getCoords(); /*get the current coordinates of the machine*/
    this.ws.coordUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.coord[0].x = value.x;
      this.coord[0].y = value.y;
      this.coord[0].z = value.z;
      
    });
    this.ws.coordShowedUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
    console.log("coordShowedUpdated : ", value);
      this.coordinateX = value.x;
      this.coordinateY = value.y;
      this.coordinateZ = value.z;
    });
    this.ws.newOffsetX.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      
      this.coordinateX = this.coordinateX-(Number(this.app.currentConfigX.offset) - value);
      this.app.currentConfigX.offset = value.toString();
    });
    this.ws.newOffsetY.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.coordinateY = this.coordinateY-(Number(this.app.currentConfigY.offset) - value);
      this.app.currentConfigY.offset = value.toString();
    });
    this.ws.newOffsetZ.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.coordinateZ = this.coordinateZ-(Number(this.app.currentConfigZ.offset) - value);
      this.app.currentConfigZ.offset = value.toString();
    });
    this.ws.axisUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.axisX = value.x;
      this.axisY = value.y;
      this.axisZ = value.z;
      console.log("axisUpdated : ", value);
    });
    
  }
  ngOnChanges(): void {
    this.GetX(this.ws.coordX);
    
  }
  getCoords(): void {
    /*get the current coordinates of the machine*/
    this.coordonnees = this.coordService.getCoord();
  }
  onSelect(n : number): void {
    /*select the step of the deplacement*/
    this.selectedStep = n;
  }
  onSelectHome(): void {
    /*select the home command, allow the movements and reset the coordinates*/
    if (this.app.pause === false){
      this.commande = "G28";   
      this.app.sendMessage("G28");
      
      /*Add something to see the launch of the command*/
      /*this.onCommand = true;*/
      }
  }
  onSelectDeplacement(orientation : string, deplacement : string){
    /*Add something to see the launch of the command*/
    if ((this.selectedStep) && (this.app.home) && (this.app.movingAllowed === true)) {
      /*if we can do a movement*/
      this.deplacement = deplacement;
      this.orientation = orientation;
      if(this.app.currentConfigX.offset === '0'){
        console.log("no offset");
        this.DeplNoOffset(deplacement, orientation);
        this.tempX = this.coord[0].x - this.coordinateX;
        this.tempY = this.coord[0].y - this.coordinateY;
        this.tempZ = this.coord[0].z - this.coordinateZ;
        this.coordinateX = this.coord[0].x ;
        this.coordinateY = this.coord[0].y ;
        this.coordinateZ = this.coord[0].z ;
      }
      else{
        console.log("offset = ", this.app.currentConfigX.offset );
        this.DeplOffset(orientation, Number(this.app.currentConfigX.offset), deplacement);
      }
      console.log(this.coord[0].x, this.coord[0].y, this.coord[0].z);
      this.speedmode = "G1";  /*Set the speedmode to G1 (feedrate) when moving using the buttons*/
      if(this.selectedStep>0){
        console.log("ici",this.coord[0].x, this.selectedStep )
        if(orientation === "X"){
          this.commande = this.speedmode + orientation + this.tempX; /*Create the command to send to the websocket if sent from the 3 coordinates, already using the signs*/
        }
        if(orientation === "Y"){
          this.commande = this.speedmode + orientation + this.tempY; /*Create the command to send to the websocket if sent from the 3 coordinates, already using the signs*/
        }
        if(orientation === "Z"){
          this.commande = this.speedmode + orientation + this.tempZ; /*Create the command to send to the websocket if sent from the 3 coordinates, already using the signs*/
        }
      }
      else{
        if(orientation === "X"){
          this.commande = this.speedmode + orientation + this.deplacement + this.tempX; /*Create the command to send to the websocket if sent from the 3 coordinates, already using the signs*/
        }
        if(orientation === "Y"){
          this.commande = this.speedmode + orientation + this.deplacement + this.tempY; /*Create the command to send to the websocket if sent from the 3 coordinates, already using the signs*/
        }
        if(orientation === "Z"){
          this.commande = this.speedmode + orientation + this.deplacement + this.tempZ; /*Create the command to send to the websocket if sent from the 3 coordinates, already using the signs*/
        }
     }
      this.app.sendMessage(this.commande)  /*Send the command to the websocket*/
      /*this.onCommand = true;*/
      

    }
    /*Create and display the exeptions*/
    else if ((this.selectedStep) && !(this.app.home) && (this.app.pause === false)){
      this.commande = "Home not done";
    }
    else if (!(this.selectedStep) && (this.app.home) && (this.app.pause === false)){
      this.commande = "Step not chosen";
    }
    else if (this.app.pause === true){
      this.commande = "Process paused";
    }
    else {
      this.commande = "Home not done and step not chosen";
    }
    
  }
  onSelectDeplacementCoord(orientation : string){
    /*Add something to see the launch of the command*/

    if ((this.selectedStep) && (this.app.home) && (this.app.movingAllowed === true)) {
      /*if we can do a movement*/
      this.orientation = orientation;
      if (this.listSpeedMode === "feedrate")
      {
        this.speedmode = "G1";
      }
      else {
        this.speedmode = "G0";
      }
      if(this.app.currentConfigX.offset === '0'){
        console.log("no offset");
        this.DeplNoOffsetCoord(orientation);
      }
      else{
        console.log("offset = ", this.app.currentConfigX.offset);
        /*this.DeplOffsetCoord(orientation, Number(this.configService.configurationdata[0].offset));*/
      }
      console.log(this.coord[0].x, this.coord[0].y, this.coord[0].z);
      this.selectedStep = undefined;    
    }
    /*Create and display the exeptions*/
    else if ((this.selectedStep) && !(this.app.home) && (this.app.pause === false)){
      this.commande = "Home not done";
    }
    else if (!(this.selectedStep) && (this.app.home) && (this.app.pause === false)){
      this.commande = "Step not chosen";
    }
    else if (this.app.pause === true){
      this.commande = "Process paused";
    }
    else {
      this.commande = "Home not done and step not chosen";
    }
  }
  DeplNoOffset(deplacement : string, orientation : string){
    /*Add something to see the launch of the command*/
    if (orientation === "X" && this.selectedStep){
      if (deplacement === "" ){
        this.coord[0].x = Number(this.coord[0].x) + Number(this.selectedStep);
        if(this.coord[0].x > 14000){
          this.coord[0].x=14000;
        }
      }
      else{
        if (this.coord[0].x - this.selectedStep >= 0){
          this.coord[0].x = this.coord[0].x - this.selectedStep;
        }
        else{
          this.coord[0].x = 0;
        }
      }
      if (this.coord[0].x < 0){
        this.coord[0].x = 0;
      }
    }
    else if (orientation === "Y" && this.selectedStep){
      if (deplacement === ""){
        this.coord[0].y = Number(this.coord[0].y) + Number(this.selectedStep);
      }
      else{
        if(this.coord[0].y - this.selectedStep >= 0){
          this.coord[0].y = this.coord[0].y - this.selectedStep;
        }
        else{
          this.coord[0].y = 0;
        }
      if (this.coord[0].y < 0){
        this.coord[0].y = 0;
      }
    }
    }
    else if (orientation === "Z" && this.selectedStep){
      if (deplacement === "" ){
        this.coord[0].z = Number(this.coord[0].z) + Number(this.selectedStep);
      }
      else{
        if (this.coord[0].z - this.selectedStep >= 0){
          this.coord[0].z = this.coord[0].z - this.selectedStep;
        }
        else{
          this.coord[0].z = 0;
        }
      }
      if (this.coord[0].z < 0){
        this.coord[0].z = 0;
      }
    }
  }
  DeplOffset(orientation : string, offset : number, deplacement : string ){
    /*Add something to see the launch of the command*/
    if (orientation === "X" && this.selectedStep){
      if(deplacement === ""){
        if(Number(this.coordinateX) + Number(this.selectedStep) <= 14000){
          this.coord[0].x = this.coord[0].x + this.selectedStep;
          this.coordinateX = this.coord[0].x + Number(this.app.currentConfigX.offset);
        }
        else{
          this.coord[0].x = 14000-Number(this.app.currentConfigX.offset);
          this.coordinateX = 14000;
          console.log("boucle 2");
        }
      }
      else{
        if(this.coord[0].x - this.selectedStep >= 0){
          this.coord[0].x = this.coord[0].x - this.selectedStep;
          this.coordinateX = this.coord[0].x + Number(this.app.currentConfigX.offset);
        }
        else{
          this.coord[0].x = 0;
          this.coordinateX = 0 + Number(this.app.currentConfigX.offset);
        }
      }
    }
    else if (orientation === "Y" && this.selectedStep){
      if(deplacement === ""){
        if(Number(this.coordinateY) + Number(this.selectedStep) <= 14000){
          this.coord[0].y = this.coord[0].y + this.selectedStep;
          this.coordinateY = this.coord[0].y + Number(this.app.currentConfigY.offset);
        }
        else{
          this.coord[0].y = 14000-Number(this.app.currentConfigY.offset);
          this.coordinateY = 14000;
        }
      }
      else{
        if(this.coord[0].y - this.selectedStep >= 0){
          this.coord[0].y = this.coord[0].y - this.selectedStep;
          this.coordinateY = this.coord[0].y + Number(this.app.currentConfigY.offset);
        }
        else{
          this.coord[0].y = 0;
          this.coordinateY = 0 + Number(this.app.currentConfigY.offset);
        }
      }
    }
    else if (orientation === "Z" && this.selectedStep){
      if(deplacement === ""){
        if(Number(this.coordinateZ) + Number(this.selectedStep) <= 14000){
          this.coord[0].z = this.coord[0].z + this.selectedStep;
          this.coordinateZ = this.coord[0].z + Number(this.app.currentConfigZ.offset);
        }
        else{
          this.coord[0].z = 14000-Number(this.app.currentConfigZ.offset);
          this.coordinateZ = 14000;
        }
      }
      else{
        if(this.coord[0].z - this.selectedStep >= 0){
          this.coord[0].z = this.coord[0].z - this.selectedStep;
          this.coordinateZ = this.coord[0].z + Number(this.app.currentConfigZ.offset);
        }
        else{
          this.coord[0].z = 0;
          this.coordinateZ = 0 + Number(this.app.currentConfigZ.offset);
        }
      }
    }
  }
  DeplNoOffsetCoord(orientation : string){
    /*Add something to see the launch of the command*/
    if (orientation === "X" && this.selectedStep){
        
      /*Create the command to send to the websocket*/
      if (this.selectedStep > this.coord[0].x){
        this.commande = this.speedmode + this.orientation + (this.selectedStep - this.coord[0].x);
      }
      else{
        this.commande = this.speedmode + this.orientation +"-"+ (this.coord[0].x - this.selectedStep);
        
      }
    
    this.coord[0].x = Number(this.selectedStep);
    this.app.sendMessage(this.commande)  /*Send the command to the websocket*/
    }
    else if (orientation === "Y" && this.selectedStep){
        /*Create the command to send to the websocket*/
        if (this.selectedStep > this.coord[0].y){
          this.commande = this.speedmode + this.orientation + (this.selectedStep - this.coord[0].y);
        }
        else{
          this.commande = this.speedmode + this.orientation +"-"+ (this.coord[0].y - this.selectedStep);
          
        }
      
      this.coord[0].y = Number(this.selectedStep);
      this.app.sendMessage(this.commande)  /*Send the command to the websocket*/
    }

    else if (this.orientation === "Z" && this.selectedStep){
        /*Create the command to send to the websocket*/
        if (this.selectedStep > this.coord[0].z){
          this.commande = this.speedmode + this.orientation + (this.selectedStep - this.coord[0].z);
        }
        else{
          this.commande = this.speedmode + this.orientation +"-"+ (this.coord[0].z - this.selectedStep);
          
        }
      
      this.coord[0].z = Number(this.selectedStep);
      this.app.sendMessage(this.commande)  /*Send the command to the websocket*/
    }
  }
  onGetCoords(): void {
      /*get the current coordinates of the machine*/
      if(!this.app.home) {
        this.app.sendMessage("G28");
      }
      this.app.sendMessage("M114");
      /*this.coord[0].x = this.ws.coordX;*/

  }
  GetX(value : number){
      this.coord[0].x = value;
  }
  onSelectCoordinates(x : number, y : number, z : number){
      /*select the coordinates of the machine*/
      
      if (x != undefined){
        if(x>=0 && this.coord[0].x != x){
          this.selectedStep = x;
          this.onSelectDeplacementCoord("X");
        }
        else if (x<0){
          console.log("X cannot be negative");
        }
      }
      if (y != undefined){
        if(y>=0 && this.coord[0].y != y){
          this.selectedStep = y;
          this.onSelectDeplacementCoord("Y");
        }
        else if (y<0){
          console.log("Z cannot be negative");
        }
      }
      if (z != undefined){
        if(z>=0 && this.coord[0].z != z){
          this.selectedStep = z;
          this.onSelectDeplacementCoord("Z");
        }
        else if (z<0){
          console.log("Z cannot be negative");
        }
        
        
      }
      
  } 
}
