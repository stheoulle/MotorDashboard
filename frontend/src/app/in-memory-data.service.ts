import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Config } from './config';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const configs = [
      {id :0, speed: "fastmode", mode : "relatif", acceleration : "2", name : "DefaultConfig"},
      /*{id :1, speed: "fastmode", mode : "absolu", acceleration : "2", step : "1", name : "Config1"},
      {id :2, speed: "fastmode", mode : "absolu", acceleration : "2", step : "1", name: "Config2"},
      {id :3, speed: "fastmode", mode : "absolu", acceleration : "2", step : "1", name: "Config3"},
      {id :4, speed: "speedrate", mode : "absolu", acceleration : "2", step : "1", name: "Config4"},
      {id :5, speed: "speedrate", mode : "absolu", acceleration : "2", step : "1", name: "Config5"},
      {id :6, speed: "speedrate", mode : "absolu", acceleration : "2", step : "1", name: "Config6"},
      {id :7, speed: "speedrate", mode : "absolu", acceleration : "2", step : "1", name: "Config7"}*/
    ];
    const coords = [
      {x: 10, y : 100, z : 0}];
    return {configs, coords};
  }

  // Overrides the genId method to ensure that a hero always has an id.
  // If the heroes array is empty,
  // the method below returns the initial number (11).
  // if the heroes array is not empty, the method below returns the highest
  // hero id + 1.
  genId(configs: Config[]): number {
    return configs.length > 0 ? Math.max(...configs.map(config=> config.id)) + 1 : 11;
  }
}