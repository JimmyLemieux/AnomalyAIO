import { Component, OnInit } from '@angular/core';
import { AnomalyService } from '../../anomaly.service';
import { HttpClient } from '@angular/common/http';
import {Session} from '../sessions/session';


@Component({
  selector: 'app-checkouts',
  templateUrl: './checkouts.component.html',
  styleUrls: ['./checkouts.component.scss']
})
export class CheckoutsComponent implements OnInit {

  sessions: Session[] = [];
  didOpenCheckout: boolean = false;
  sessionHash: Map<number, Session> = new Map<number, Session>();
  constructor(private _anomalyService: AnomalyService, private _http: HttpClient) { }

  ngOnInit(): void {
    this._anomalyService.sendCheckout.subscribe(data => {
      let cast = (data as Session);
      if (!this.sessionHash.has(cast.id)) {
        this.sessions.push(cast);
        this.sessionHash.set(cast.id, cast);
      }
    });

    this._anomalyService.updateCheckoutView.subscribe(data => {
      (data as Array<any>).map((_x: any) => {
        if (this.sessionHash.has(_x.id)) {
          if (_x.status.includes("DONE")) {
            this.sessions.find(x => x.id === _x.id)!.didOpenCheckout = true;
          }
          let item = this.sessions.find(x => x.id === _x.id);
          if (item !== undefined) {
            this.sessions.find(x => x.id === _x.id)!.status = _x.status;
          }
        }
      });
    });
  }

  openCheckout(session: Session): void {
    // session.didOpenCheckout = true;
    this._http.post("http://localhost:3000/checkout", {session: session}).subscribe(data => {
      console.log(data);
    });
  }

}
