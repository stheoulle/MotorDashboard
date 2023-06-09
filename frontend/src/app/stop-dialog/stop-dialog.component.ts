import { Injectable } from '@angular/core';  
import { Router, NavigationStart } from '@angular/router';  
import { Observable } from 'rxjs';  
import { Subject } from 'rxjs';  
  
@Injectable() export class StopDialogComponent{  
    private subject = new Subject<any>();  
  
    stopThis(message: string): any {  
        this.setStop(message);  
    }  
  
    setStop(message: string): any {  
        const that = this;  
        this.subject.next({  
            type: 'stop',  
            text: message,
        });  
  
    }
  
    getMessage(): Observable<any> {  
        return this.subject.asObservable();  
    }  
}  