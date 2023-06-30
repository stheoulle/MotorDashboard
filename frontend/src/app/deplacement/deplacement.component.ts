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

  axisX : boolean = false;
  axisY : boolean = false;
  axisZ : boolean = false;
  tempX : number = 0;
  tempY : number = 0;
  tempZ : number = 0;

  coordinateX : number = 0;
  coordinateY : number = 0;
  coordinateZ : number = 0;

  mm : boolean = true;
  steps : boolean = false;

  constructor(private coordService: CoordService, public app : AppComponent, public ws : WebSocketService, private configService : ConfigService) {
  }

  ngOnInit(): void {
    this.getCoords(); /*get the current coordinates of the machine*/
    this.ws.coordUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.coord[0].x = value.x;
      this.coordinateX = value.x;
      this.coord[0].y = value.y;
      this.coordinateY = value.y;
      this.coord[0].z = value.z;
      this.coordinateZ = value.z;
    });
    this.ws.coordShowedUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      console.log("coordShowedUpdated : ", value);
      for (let axis of this.app.axis) {
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
    this.ws.newOffset.subscribe((event) => { /*get the current coordinates of the machine when there is an update or pause*/
      console.log("newOffset" + event.name+" : ", event.value);
      let axis = this.app.axis.find((entry) => entry.name == event.name);
      if (axis != undefined) {
        axis.coordinate = null;
        axis.conf.offset = event.value;
      }
    });
    this.ws.axisUpdated.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.axisX = value.x;
      this.axisY = value.y;
      this.axisZ = value.z;
      console.log("axisUpdated : ", value);
    });
    this.ws.homeUpdate.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.app.home = value;
      this.ws.axisX = false;
      this.ws.axisY = false;
      this.ws.axisZ = false;
      this.app.knownConfig = false;
      console.log("homeUpdated : ", value);
    });
    this.app.resetCoord.subscribe((value) => { /*get the current coordinates of the machine when there is an update or pause*/
      this.coord[0].x = 0;
      this.coord[0].y = 0;
      this.coord[0].z = 0;
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
      let value : string = "0";
      this.deplacement = deplacement;
      this.orientation = orientation;
      this.speedmode = "G1";  /*Set the speedmode to G1 (feedrate) when moving using the buttons*/
      let axis = this.app.axis.find(entry => entry.name == orientation);
      if(axis != undefined) {
        if ( axis.conf.offset === 0 || axis.conf.offset === null ){
          this.DeplNoOffset(deplacement, orientation);
          console.log("no offset");
          let coord: number = 0;
          if (orientation === "X")
            coord = this.coord[0].x;
          if (orientation === "Y")
            coord = this.coord[0].y;
          if (orientation === "Z")
            coord = this.coord[0].z;
          if (axis.coordinate !== null) {
            value = (coord - axis.coordinate).toString();
          }
          axis.coordinate = coord;
        }
        else{
          console.log("offset = ", axis.conf.offset );
          this.DeplOffset(orientation, axis.conf.offset, deplacement);
          value = this.selectedStep.toString();
        }
      }
      
      console.log("ici",this.coord[0].x, this.selectedStep )
      for (let axis in ["X", "Y", "Z"]){
        this.commande = this.speedmode + orientation + deplacement + value; /*Create the command to send to the websocket if sent from the 3 coordinates, already using the signs*/
      }
      this.app.sendMessage(this.commande)  /*Send the command to the websocket*/
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

  onSelectDeplacementCoord(orientation : string, value : number){
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
      let axis = this.app.axis.find(entry => entry.name == orientation);
      if(axis != undefined) {
        if(axis.conf.offset === 0 || axis.conf.offset === null){
          console.log("no offset");
          this.DeplNoOffsetCoord(orientation);
        }
        else{
          console.log("offset = ", axis.conf.offset);
          this.DeplOffsetCoord(orientation, Number(this.configService.configurationdata[0].offset),Number(this.configService.configurationdata[1].offset),Number(this.configService.configurationdata[2].offset));
        }
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
        if(this.coord[0].x > 22){ ///Change to the max amplitude of the machine
          this.coord[0].x=22;
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
        if(this.coord[0].y > 22){   ///Change to the max amplitude of the machine
          this.coord[0].y=22;
        }
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
        if(this.coord[0].z > 22){   
          this.coord[0].z=22;
        }
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
    /*Calculate the coordinate where to send the system, and the coordonate to display*/
    if (orientation === "X" && this.selectedStep){
      let axis = this.app.axis.find(entry => entry.name == orientation);
      if (axis != undefined) {
        if(deplacement === ""){
          if(axis.coordinate != null && axis.coordinate + Number(this.selectedStep) <= axis.conf.maxlength){ ///Change 22 to the max amplitude in Z of the machine
            this.coord[0].x = this.coord[0].x + Number(this.selectedStep);
            axis.coordinate = this.coord[0].x + Number(axis.conf.offset);
          }
          else{
            this.coord[0].x = axis.conf.maxlength-Number(axis.conf.offset);
            axis.coordinate = axis.conf.maxlength;
          }
        }
        else{          
          if(this.coord[0].x - this.selectedStep >= 0){
            this.coord[0].x = this.coord[0].x - Number(this.selectedStep);
            axis.coordinate = this.coord[0].x + Number(axis.conf.offset);
          }
          else{
            this.coord[0].x = 0;
            axis.coordinate = 0 + Number(axis.conf.offset);
          }
        }
      }
    }
    else if (orientation === "Y" && this.selectedStep){
      let axis = this.app.axis.find(entry => entry.name == orientation);
      if (axis != undefined) {
        if(deplacement === ""){
          if(axis.coordinate != null && axis.coordinate + Number(this.selectedStep) <= axis.conf.maxlength){ ///Change 22 to the max amplitude in Z of the machine
            this.coord[0].y = this.coord[0].y + Number(this.selectedStep);
            axis.coordinate = this.coord[0].y + Number(axis.conf.offset);
          }
          else{
            this.coord[0].y = axis.conf.maxlength-Number(axis.conf.offset);
            axis.coordinate = axis.conf.maxlength;
          }
        }
        else{          
          if(this.coord[0].y - this.selectedStep >= 0){
            this.coord[0].y = this.coord[0].y - Number(this.selectedStep);
            axis.coordinate = this.coord[0].y + Number(axis.conf.offset);
          }
          else{
            this.coord[0].y = 0;
            axis.coordinate = 0 + Number(axis.conf.offset);
          }
        }
      }
    }
    else if (orientation === "Z" && this.selectedStep){
      let axis = this.app.axis.find(entry => entry.name == orientation);
      if (axis != undefined) {
        if(deplacement === ""){
          if(axis.coordinate != null && axis.coordinate + Number(this.selectedStep) <= axis.conf.maxlength){ ///Change 22 to the max amplitude in Z of the machine
            this.coord[0].z = this.coord[0].z + Number(this.selectedStep);
            axis.coordinate = this.coord[0].z + Number(axis.conf.offset);
          }
          else{
            this.coord[0].z = axis.conf.maxlength-Number(axis.conf.offset);
            axis.coordinate = axis.conf.maxlength;
          }
        }
        else{          
          if(this.coord[0].z - this.selectedStep >= 0){
            this.coord[0].z = this.coord[0].z - Number(this.selectedStep);
            axis.coordinate = this.coord[0].z + Number(axis.conf.offset);
          }
          else{
            this.coord[0].z = 0;
            axis.coordinate = 0 + Number(axis.conf.offset);
          }
        }
      }
    }
    this.ws.coordX = this.coord[0].x;
    this.ws.coordY = this.coord[0].y;
    this.ws.coordZ = this.coord[0].z;
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

  DeplOffsetCoord(orientation: string, offsetX: number, offsetY: number, offsetZ: number) {
    /* Add something to see the launch of the command */
    if (orientation === "X" && this.selectedStep) {
      /* Create the command to send to the websocket */
      if (this.selectedStep > this.coord[0].x) {
        this.commande = this.speedmode + this.orientation + (this.selectedStep - this.coord[0].x - offsetX);
      } else {
        this.commande = this.speedmode + this.orientation + "-" + (this.coord[0].x - this.selectedStep - offsetX);
      }
      this.coord[0].x = Number(this.selectedStep) + offsetX;
      this.app.sendMessage(this.commande); /* Send the command to the websocket */
    } else if (orientation === "Y" && this.selectedStep) {
      /* Create the command to send to the websocket */
      if (this.selectedStep > this.coord[0].y) {
        this.commande = this.speedmode + this.orientation + (this.selectedStep - this.coord[0].y - offsetY);
      } else {
        this.commande = this.speedmode + this.orientation + "-" + (this.coord[0].y - this.selectedStep - offsetY);
      }
      this.coord[0].y = Number(this.selectedStep) + offsetY;
      this.app.sendMessage(this.commande); /* Send the command to the websocket */
    } else if (orientation === "Z" && this.selectedStep) {
      /* Create the command to send to the websocket */
      if (this.selectedStep > this.coord[0].z) {
        this.commande = this.speedmode + this.orientation + (this.selectedStep - this.coord[0].z - offsetZ);
      } else {
        this.commande = this.speedmode + this.orientation + "-" + (this.coord[0].z - this.selectedStep - offsetZ);
      }
      this.coord[0].z = Number(this.selectedStep) + offsetZ;
      this.app.sendMessage(this.commande); /* Send the command to the websocket */
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
          this.onSelectDeplacementCoord("X", x);
        }
        else if (x<0){
          console.log("X cannot be negative");
        }
      }
      if (y != undefined){
        if(y>=0 && this.coord[0].y != y){
          this.selectedStep = y;
          this.onSelectDeplacementCoord("Y", y);
        }
        else if (y<0){
          console.log("Z cannot be negative");
        }
      }
      if (z != undefined){
        if(z>=0 && this.coord[0].z != z){
          this.selectedStep = z;
          this.onSelectDeplacementCoord("Z",z);
        }
        else if (z<0){
          console.log("Z cannot be negative");
        }
      }
  } 


  checkAndSelectCoordinates(coordinateX?: number, coordinateY?: number, coordinateZ?: number) {
    // Vérification et affectation des valeurs par défaut
    coordinateX = typeof coordinateX !== 'undefined' ? coordinateX : 0;
    coordinateY = typeof coordinateY !== 'undefined' ? coordinateY : 0;
    coordinateZ = typeof coordinateZ !== 'undefined' ? coordinateZ : 0;
  
    // Appeler la fonction onSelectCoordinates avec les coordonnées mises à jour
    this.onSelectCoordinates(coordinateX, coordinateY, coordinateZ);
  }  
}
