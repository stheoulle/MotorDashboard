/*import { Injectable } from '@angular/core';
import { DeplacementComponent } from './deplacement/deplacement.component';

@Injectable({
  providedIn: 'root'
})
export class OnSelectMoveService {

  constructor(private deplacement : DeplacementComponent) { }
  
  onSelectDeplacement(orientation : string, deplacement : string){
    /*Add something to see the launch of the command

    if ((this.deplacement.selectedStep) && (this.deplacement.home) && (this.deplacement.movingAllowed.movingAllowed == true)) {
      /*if we can do a movement
      this.deplacement.deplacement = deplacement;
      this.deplacement.orientation = orientation;
      
      if (orientation == "X"){
        if (deplacement == ""){
          this.deplacement.coord[0].x = this.deplacement.coord[0].x + this.deplacement.selectedStep;
        }
        else{
          if (this.deplacement.coord[0].x - this.deplacement.selectedStep >= 0){
            this.deplacement.coord[0].x = this.deplacement.coord[0].x - this.deplacement.selectedStep;
          }
          else{
            this.deplacement.coord[0].x = 0;
          }
        }
      }
      else if (orientation == "Y"){
        if (deplacement == ""){
          this.deplacement.coord[0].y = this.deplacement.coord[0].y + this.deplacement.selectedStep;
        }
        else{
          if(this.deplacement.coord[0].y - this.deplacement.selectedStep >= 0){
            this.deplacement.coord[0].y = this.deplacement.coord[0].y - this.deplacement.selectedStep;
          }
          else{
            this.deplacement.coord[0].y = 0;
          }
      }
      }
      else if (orientation == "Z"){
        if (deplacement == ""){
          this.deplacement.coord[0].z = this.deplacement.coord[0].z + this.deplacement.selectedStep;
        }
        else{
          if (this.deplacement.coord[0].z - this.deplacement.selectedStep >= 0){
            this.deplacement.coord[0].z = this.deplacement.coord[0].z - this.deplacement.selectedStep;
          }
        }
      }
      if (this.deplacement.movingAllowed.speedmode == "fastspeed")
      {
        this.deplacement.speedmode = "G0";
      }
      else {
        this.deplacement.speedmode = "G1";
      }
      this.deplacement.commande = this.deplacement.speedmode + orientation + this.deplacement + this.deplacement.selectedStep;  /*Create the command to send to the websocket
      this.deplacement.movingAllowed.sendMessage(this.deplacement.commande)  /*Send the command to the websocket
      /*this.onCommand = true;
    }
    /*Create and display the exeptions
    else if ((this.deplacement.selectedStep) && !(this.deplacement.home) && (this.deplacement.movingAllowed.pause == false)){
      this.deplacement.commande = "Home not done";
    }
    else if (!(this.deplacement.selectedStep) && (this.deplacement.home) && (this.deplacement.movingAllowed.pause == false)){
      this.deplacement.commande = "Step not chosen";
    }
    else if (this.deplacement.movingAllowed.pause == true){
      this.deplacement.commande = "Process paused";
    }
    else {
      this.deplacement.commande = "Home not done and step not chosen";
    }
  }


}*/
