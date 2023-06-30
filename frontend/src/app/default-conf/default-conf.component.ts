import { Component, Input } from '@angular/core';
import { Config } from '../config';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { ConfigService } from '../config.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-default-conf',
  templateUrl: './default-conf.component.html',
  styleUrls: ['./default-conf.component.css']
})
export class DefaultConfComponent {
  @Input() currentconfigX : Config = this.configService.getDefaultConfigX();
  @Input() currentconfigY : Config = this.configService.getDefaultConfigY();
  @Input() currentconfigZ : Config = this.configService.getDefaultConfigZ();
  
  constructor(private configService: ConfigService, public app : AppComponent) { } 
}