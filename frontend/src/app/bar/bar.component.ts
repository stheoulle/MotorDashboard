// bar.component.ts

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {
  @Input() max = 14000; // Assigning a default value of 100 to 'max'
  @Input() offset = 0; // Assigning a default value of 0 to 'offset'

  progressPercentage = 0; // Assigning a default value of 0 to 'progressPercentage'
  cursorPosition = 0; // Assigning a default value of 0 to 'cursorPosition'

  ngOnInit() {
  }

  updateProgress(value: number) {
    if (value < 0) {
      this.progressPercentage = 0;
      this.cursorPosition = 0;
    } else if (value > this.max) {
      this.progressPercentage = 100;
      this.cursorPosition = 100;
    } else {
      this.progressPercentage = (value / this.max) * 100;
      this.cursorPosition = ((value + this.offset) / this.max) * 100;
    }
  }
}
