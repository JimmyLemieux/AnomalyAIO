import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class AnomalyService {

  constructor() { }

  public updateSessionsView = new Subject();
  public updateCheckoutView = new Subject();
  public sendCheckout = new Subject();

}
