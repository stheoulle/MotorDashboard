import { Component } from '@angular/core';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-receipe',
  templateUrl: './receipe.component.html',
  styleUrls: ['./receipe.component.css']
})
export class ReceipeComponent {

  constructor(public ws : WebSocketService) { }

  ngOnInit(): void {
  }

}
