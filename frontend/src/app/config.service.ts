/*The ConfigService could get hero data from anywhere such as a web service, local storage, or a mock data source.*/
import { Injectable } from '@angular/core';

import { Config } from './config';
import Configurations from './configs.json';

import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http'; /**HttpClient.get() returns the body of the response as an untyped JSON object by default. Applying the optional type specifier, <Hero[]> , gives you a typed result object. */

interface ConfigData {
  id: number;
  speed: string;
  mode: string;
  acceleration: string;
  name: string;
  step : string;
  offset : string;
  axis : string;
}

@Injectable({     /**object that chooses and injects the provider where the application requires it. */
  providedIn: 'root'
})
export class ConfigService {
  configurationdata : ConfigData[] = Configurations;

  constructor( /**constructor parameters */
    private http: HttpClient,  /**declares a private messageService property. Angular injects the singleton MessageService into that property when it creates the HeroService. */
    private messageService: MessageService) {}   /**declares a private messageService property. Angular injects the singleton MessageService into that property when it creates the HeroService. */

  private log(message: string) {  /**private method */
    this.messageService.add(`ConfigService: ${message}`);
  }

  private configUrl = 'api/configs';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private handleError<T>(operation = 'operation', result?: T) { /**T is the type of the returned value, which is of type T (can be different each time)*/
    return (error: any): Observable<T> => {

      console.error(error); // log to console 
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  } 

  getConfigs(): Observable<Config[]> {
    return this.http.get<Config[]>(this.configUrl)
    }

  getConfig(id: number): Config {
    return this.configurationdata.find(config => config.id === id)!;
  }

  updateConfig(id: number, config : Config): void {
    this.configurationdata[id-1] = config;
  }

  addConfig(config: Config): void{
    /*add the config to the list of configs*/
    this.configurationdata.push(config);
  }

  deleteConfig(id: number): void {
    /*delete the config from the list of configs*/
    delete this.configurationdata[id-1];
    console.log("deleted config"+id);
  }

  getDefaultConfigX(): Config {
    return this.configurationdata[0];
  }

  getDefaultConfigY(): Config {
    return this.configurationdata[0];
  }

  getDefaultConfigZ(): Config {
    console.log("get the config on Z");
    console.log(this.configurationdata[2]);
    return this.configurationdata[0];
  }

  getAllConfigs(): Config[] {
    /*return the list of all the configs*/
    return this.configurationdata;
  }  
}


