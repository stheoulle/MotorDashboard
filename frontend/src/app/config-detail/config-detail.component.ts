import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '../config.service';
import { Config } from '../config';
import { Component, Input } from '@angular/core';
import { AppComponent } from '../app.component';
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


  constructor(private route: ActivatedRoute, private configService: ConfigService, public app : AppComponent, public ws : WebSocketService) { } /**The ActivatedRoute holds information about the route to this instance of the HeroDetailComponent.The HeroService gets hero data from the remote server and this component will use it to get the hero-to-display. The location is an Angular service for interacting with the browser*/
  ngOnInit(): void {
    this.getConfig();

  }
  getConfig(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')); /**The route.snapshot is a static image of the route information shortly after the component was created
    The paramMap is a dictionary of route parameter values extracted from the URL
    The "id" key returns the id of the config to fetch
    Route parameters are always strings
    The JavaScript Number function converts the string to a number, which is what a config id should be. */
    this.config = this.configService.getConfig(id);
  }
  onSelect(config: Config): void {
    /*select the config*/
    this.selectedConfig = config;
  }

  send(): void {
    if (this.config && this.config.axis != undefined) {
      this.configService.updateConfig(this.config.id, this.config)
      this.app.sendConfig(this.config.axis, this.config);
      let axis = this.app.axis.find(entry => entry.name === this.config?.axis);
      if (axis != undefined)
      {
        axis.conf= this.config;
      }
      this.app.showConfigs=false;
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
