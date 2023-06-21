import { ActivatedRoute } from '@angular/router';

import { ConfigService } from '../config.service';
import { Config } from '../config';
import { Component, Input } from '@angular/core';

import { AppComponent } from '../app.component';
import { DefaultConfComponent } from '../default-conf/default-conf.component';
import { WebSocketService } from '../websocket.service';


@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.css'],
})
export class ConfigDetailComponent {
  @Input() config? : Config;
  selectedConfig? : Config;
  defaultconfig? : Config;


  constructor(
    private route: ActivatedRoute,
    private configService: ConfigService,
    private app : AppComponent,
    public ws : WebSocketService
    /*private defaultconfig_C : DefaultConfComponent*/
    /*public pause : DeplacementComponent*/) { } /**The ActivatedRoute holds information about the route to this instance of the HeroDetailComponent.The HeroService gets hero data from the remote server and this component will use it to get the hero-to-display. The location is an Angular service for interacting with the browser*/

  ngOnInit(): void {
    this.getConfig();

  }

  getConfig(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')); /**The route.snapshot is a static image of the route information shortly after the component was created
    The paramMap is a dictionary of route parameter values extracted from the URL
    The "id" key returns the id of the hero to fetch
    Route parameters are always strings
    The JavaScript Number function converts the string to a number, which is what a hero id should be. */
    this.config = this.configService.getConfig(id);
  }

  onSelect(config: Config): void {
    /*select the config*/
    this.selectedConfig = config;
  }
  goBack(): void {
    /*return to the previous page*/
    this.config = undefined;
  }

  save(): void {
    if (this.config) {
      this.configService.updateConfig(this.config.id, this.config)
      /*this.configService.updateConfig(this.config)
        .subscribe(() => this.goBack());
        /*toggle a pop up saying that the config has been saved*/
        /*this.dialog.confirmThis("La configuration a été sauvegardée");*/
      this.app.sendConfig(this.config.acceleration, this.config.speed, this.config.mode, this.config.name, this.config.step, this.config.offset, this.config.axis);
      /*this.app.sendMessage("M114");*/
      this.app.currentConfigX = this.config;
      /*this.configService.updateDefaultConfig(this.config);*/
      /*this.defaultconfig_C.config = this.config; /**update the default config*/
    }
  }

  onSelectAxis(axis : string): void {
    /*select the axis*/
    if (this.config) {
      this.config.axis = axis;
    }
  }

  delete(id : number): void {
    /*delete the config*/
    if (this.config) {
      this.configService.deleteConfig(this.config.id);
      this.config = undefined;
    }
  }
}
