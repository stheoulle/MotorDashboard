/*The ConfigService could get hero data from anywhere such as a web service, local storage, or a mock data source.*/
import { Injectable } from '@angular/core';

import { Config } from './config';
import Configurations from './configs.json';

import { Observable, of } from 'rxjs'; /**of(HEROES) returns an Observable<Hero[]> that emits a single value, the array of mock heroes. */
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
    private messageService: MessageService,
    /*public app : AppComponent*/) {}   /**declares a private messageService property. Angular injects the singleton MessageService into that property when it creates the HeroService. */

  
/** Log a ConfigService message with the MessageService */

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
  /** GET config from the server */
  getConfigs(): Observable<Config[]> {
    return this.http.get<Config[]>(this.configUrl)
    }

  /** GET config by id. Will 404 if id not found */
  getConfig(id: number): Config {
    return this.configurationdata.find(config => config.id === id)!;
  }

  /** PUT: update the config on the server */
  /*Update ca*/
  updateConfig(id: number, config : Config): void {
    this.configurationdata[id-1] = config;
  }

  /** POST: add a new config to the server */
  /**Different than update in two ways : 
   * calls httpclient.post instead of put
   * expects the server to create an id for the new config, which it returns in the Observable<Config> to the caller.
   */
  addConfig(config: Config): void{
    /*add the config to the list of configs*/
    this.configurationdata.push(config);
  }

  /** DELETE: delete the config from the server */
  deleteConfig(id: number): void {
    /*delete the config from the list of configs*/
    delete this.configurationdata[id-1];
    console.log("deleted config"+id);
  }

  getDefaultConfigX(): Config {
   /* this.app.sendRecipe(this.configurationdata[0].acceleration, this.configurationdata[0].speed, this.configurationdata[0].mode);*/
   /*return the default config*/
    return this.configurationdata[0];
  }

  getDefaultConfigY(): Config {
    /*return the default config*/
    return this.configurationdata[4];
  }

  getDefaultConfigZ(): Config {
    /*return the default config*/
    return this.configurationdata[5];
  }

  getAllConfigs(): Config[] {
    /*return the list of all the configs*/
    return this.configurationdata;
  }  
}


