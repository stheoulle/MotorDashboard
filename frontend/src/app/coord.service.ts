import { Injectable } from '@angular/core';
import { Coordonnees } from './coordonneesCartesien';
import { COORDONNEES } from './mock.coordonnees';

@Injectable({
  providedIn: 'root'
})
export class CoordService {

  constructor() { }

  getCoord (): Coordonnees[] {
    return COORDONNEES;
  }
}
