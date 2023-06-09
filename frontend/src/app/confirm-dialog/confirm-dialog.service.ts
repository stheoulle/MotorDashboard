import { Injectable } from '@angular/core';  
import { Router, NavigationStart } from '@angular/router';  
import { Observable } from 'rxjs';  
import { Subject } from 'rxjs';  
  
@Injectable() export class ConfirmDialogService {  
    private subject = new Subject<any>();  
  
    confirmThis(message: string): any {  
        this.setConfirmation(message);  
    }  
  
    setConfirmation(message: string): any {  
        const that = this;  
        this.subject.next({  
            type: 'confirm',  
            text: message,
        });  
  
    }
  
    getMessage(): Observable<any> {  
        return this.subject.asObservable();  
    }  
}  