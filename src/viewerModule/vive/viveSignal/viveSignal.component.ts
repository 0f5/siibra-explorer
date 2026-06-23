import { Component } from "@angular/core";
import { map } from "rxjs/operators";
import { ViveService } from "../service";

@Component({
  selector: 'htc-vive-tracker-status',
  templateUrl: './viveSignal.template.html',
  styleUrls: [
    './viveSignal.style.css'
  ]
})
export class ViveSignal{
  
  public ready$ = this.svc.ready$
  public connected$ = this.svc.connected$.pipe(
    map(hands => hands)
  )
  public currentpos$ = this.svc.currentpos$.pipe(c=>c)
  public currentquad$ = this.svc.currentquad$.pipe(c=>c)
  constructor(
    private svc: ViveService
  ){

  }
}
