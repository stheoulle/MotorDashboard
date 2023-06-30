import { Component, OnInit, Input} from '@angular/core';
import { Config} from '../config';
import { ConfigService } from '../config.service';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  @Input() configDisplayed? : Config;
  selectedConfig?: Config;
  configurations : Config[] = [];
  nom : string = "new config";

  constructor(private configService: ConfigService, public ws : WebSocketService) { }
  ngOnInit(): void {
    this.getConfig();
  }
  getConfig(): void { 
    /*get the list of all the configs from the JSON*/
    this.configurations = this.configService.getAllConfigs();
  }
  onSelect(config: Config): void {
    /*select the config*/
    this.selectedConfig = config;
  }
  delete(config: Config): void {
    /*delete the config*/
    this.configService.deleteConfig(config.id);
  }
  getLastID(): number {
    /*get the last ID of the list*/
    return this.configurations.length;
  }
}
