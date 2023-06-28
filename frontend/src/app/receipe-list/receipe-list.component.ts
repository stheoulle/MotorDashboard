import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { ReceipeService } from '../receipe.service';
import { Receipe } from '../receipe';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-receipe-list',
  templateUrl: './receipe-list.component.html',
  styleUrls: ['./receipe-list.component.css']
})
export class ReceipeListComponent {
  commandList? : string[];
  i : number = 0;
  receipelist : Receipe[] = [];
  selectedReceipe?: Receipe;
  receipeName : string = "";
  loop : number = 1;

  constructor(public app : AppComponent, public receipeService : ReceipeService, private ws : WebSocketService) { }  /*Change to private if only used in this component, public if used in another component*/

  ngOnInit(): void {
    this.getReceipes(); /*get the current coordinates of the machine*/
  }

  delete(item : string): void {
    /*delete the config*/
    this.app.receipelistitem?.splice(this.app.receipelistitem?.indexOf(item), 1);
  }

  launch(): void {
    /*launch the receipe*/
    /*send lines one by one*/
    this.ws.onreceipe = true;
    this.i = this.app.receipelistitem?.length;
    this.ws.totalLoop = this.loop;
    for(let k = 0; k < this.loop; k++){
      for ( let j = 0; j < this.i; j++){
        console.log(this.app.receipelistitem[j], typeof(this.app.receipelistitem[j]));
        this.app.sendMessageList(this.app.receipelistitem[j]);
     }
    }
  }

  onSelect(receipe: Receipe): void {
    /*add the items of the receipe to the list*/
    this.app.receipelistitem = []
    for (let i = 0; i < receipe.receipe.length; i++){
      this.app.receipelistitem?.push(receipe.receipe[i]);
    }
  }

  addReceipe(name : string, receipeList : Array<string>): void {
    /*add a new config to the list with per default parameters*/
    this.receipeService.addReceipe( name, receipeList, this.getLastID()+1);
  }

  newReceipe(): void {
    /*clear the list of commands*/
    this.app.receipelistitem = [];
  }

  getReceipes(): void { 
    /*get the list of all the configs from the JSON*/
    this.receipelist = this.receipeService.getAllConfigs();
  }

  deleteReceipe(id : number): void {
    /*delete the config*/
    this.receipeService.deleteReceipe(id);
  }

  getLastID(): number {
    /*get the last ID of the list*/
    return this.app.receipelistitem.length;
  }
  
}