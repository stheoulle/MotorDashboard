import { Component, Input } from '@angular/core';
import { Config, ConfigInput } from '../config';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { ConfigService } from '../config.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-default-conf',
  templateUrl: './default-conf.component.html',
  styleUrls: ['./default-conf.component.css']
})
export class DefaultConfComponent {
  @Input() currentconfigX : ConfigInput = this.configService.getDefaultConfigX();
  @Input() currentconfigY : ConfigInput = this.configService.getDefaultConfigY();
  @Input() currentconfigZ : ConfigInput = this.configService.getDefaultConfigZ();
  
  constructor(private configService: ConfigService) {
    
   } 
}