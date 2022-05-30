import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { AnomalyService } from './anomaly.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


  shouldShowCheckout: boolean = false;
  constructor(private _http:HttpClient, private _anomalyService: AnomalyService) {

  }

  ngOnInit(): void {
    interval(1000).subscribe(() => {
      this._http.get('http://localhost:3000/status').subscribe(data => {
        console.log(data);
        this._anomalyService.updateSessionsView.next((data as any).sessions);
      });
    });
    // console.log(window.location.href);
  }

  checkout(): void {
    this._http.get('http://localhost:3000/checkout').subscribe(data => {
      console.log(data);
    });
  }

  test(): void {
    this._http.get('http://localhost:3000/').subscribe(data => {
      this.shouldShowCheckout = true;
      console.log(data);
    });
  }
  title = 'AnomalyAIO';
}
