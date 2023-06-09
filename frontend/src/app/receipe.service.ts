import { Injectable } from '@angular/core';
import { Receipe } from './receipe';
import Receipes  from './receipes.json';

interface ReceipeData {
  name: string;
  receipe : Array<string>;
  id : number;
}

@Injectable({
  providedIn: 'root'
})
export class ReceipeService {
  receipedata : ReceipeData[] = Receipes;

  constructor() { }

  addReceipe(name : string, listreceipe : Array<string>, id : number): void{
    /*add the config to the list of configs*/
    let receipe : ReceipeData = {name : name, receipe : listreceipe, id : id};
    this.receipedata.push(receipe);
    console.log("receipe pushed");
  }

  getAllConfigs(): Receipe[] {
    /*return the list of all the configs*/
    return this.receipedata;
  }

  deleteReceipe(id : number): void {
    /*delete the config with the corresponding id*/
    this.receipedata.splice(this.receipedata.findIndex((item) => item.id === id), 1);
  }
}
