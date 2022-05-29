import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SetupComponent } from './places/setup/setup.component';
import { SessionsComponent } from './places/sessions/sessions.component';
import { CheckoutsComponent } from './places/checkouts/checkouts.component';
import { ReactiveFormsModule } from '@angular/forms';
import {AnomalyService} from './anomaly.service';

@NgModule({
  declarations: [
    AppComponent,
    SetupComponent,
    SessionsComponent,
    CheckoutsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule
  ],
  providers: [AnomalyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
