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
  @Input() currentconfig : ConfigInput = this.configService.getDefaultConfig();
  
  constructor(private configService: ConfigService) {
    
   } 

}