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

  /*addCommand(type : string, direction : string, coordinates : string): void {
    /*add a command to the receipe
    this.type = type;
    this.direction = direction;
    this.coordinates = coordinates;
  }*/

  saveCommand(): void {
    /*save the command to the receipe list*/
    console.log(this.type, this.direction, this.coordinates);
    if (this.type != undefined && this.direction != undefined && this.coordinates != undefined && this.type != "G28" && this.type != "M24" && this.type != "M25"){
      this.app.receipelistitem?.push(this.type + " " + this.direction + "" + this.coordinates);
      /*this.app.receipelistitem?.push(this.type + " " + this.direction + " " + this.coordinates);*/
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
