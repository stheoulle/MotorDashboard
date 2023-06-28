import { Component } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-receipe-details',
  templateUrl: './receipe-details.component.html',
  styleUrls: ['./receipe-details.component.css']
})
export class ReceipeDetailsComponent {
  type? : string;
  direction? : string;
  coordinates? : string;

  constructor(public app : AppComponent) { }

  saveCommand(): void {
    /*save the command to the receipe list*/
    console.log(this.type, this.direction, this.coordinates);
    if (this.type != undefined && this.direction != undefined && this.coordinates != undefined && this.type != "G28" && this.type != "M24" && this.type != "M25"){
      if(this.app.speedmode == "fastspeed"){
        this.app.receipelistitem?.push("G0 " + this.direction + this.coordinates);
      }
      else{
        this.app.receipelistitem?.push("G1 " + this.direction + "" + this.coordinates);
      }
    }
    else if (this.type == "G28" || this.type == "M24" || this.type == "M25"){
      this.app.receipelistitem?.push(this.type);
    }
  }

  deleteCommand(): void {
    /*delete the command to the receipe*/
    this.type = undefined;
    this.direction = undefined;
    this.coordinates = undefined;
  }
}
