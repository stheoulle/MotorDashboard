import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: string[] = [];

  add(message: string) {    /**add() a message to the cache. */
    this.messages.push(message);
  }

  clear() {     /**clear() the cache */
    this.messages = [];
  }
}