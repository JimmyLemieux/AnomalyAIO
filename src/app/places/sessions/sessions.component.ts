import { Component, OnInit } from '@angular/core';
import {Session} from './session';
import { AnomalyService } from '../../anomaly.service';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {

  sessions_queued: number = 0;
  sessions_running: number = 0;
  sessions: Session[] = [];
  sessionHash: Map<number, Object> = new Map<number, Object>();

  constructor(private _anomalyService: AnomalyService,
    private _http: HttpClient) { }

  ngOnInit(): void {
    this._anomalyService.updateSessionsView.subscribe((data) => {
      this.sessions_running = (data as Array<any>).length;
      (data as Array<any>).map((_x: any) => {
        if (this.sessionHash.get(_x.id) === undefined) {
          let obj = new Session(_x.id, _x.status, false, false);
          this.sessions.push(obj)
          this.sessionHash.set(_x.id, obj);
        } else {
          console.log("here!");
          let item = this.sessions.find(x => x.id === _x.id);
          if (item !== undefined) {
            this.sessions.find(x => x.id === _x.id)!.status = _x.status;
          }
          if ((_x.status as string).includes("CHECKOUT") && item !== undefined) {
            this.sessions.find(x => x.id === _x.id)!.shouldCheckout = true;
            this._anomalyService.sendCheckout.next(item);
            this.sessions = this.sessions.filter(x => x.id !== _x.id);
          }
        }
      });
    });
    this.sessions_queued = this.sessions.length;
  }

  openCheckout(session: Session): void {
    console.log(session);
    this._http.post("http://localhost:3000/checkout", {session: session}).subscribe(data => {
      console.log(data);
    });
  }

}
